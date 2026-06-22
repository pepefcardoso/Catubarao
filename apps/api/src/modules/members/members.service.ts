import type { PrismaClient } from "@repo/db";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import type { UpdateMemberProfileSchema } from "@repo/schemas/member";
import type { z } from "zod";
import { generateCardToken } from "../../lib/qr";

type UpdateMemberProfileInput = z.infer<typeof UpdateMemberProfileSchema>;

export const isEligibleToVote = (member: { adimplenciaStreakMonths: number }) => {
  return member.adimplenciaStreakMonths >= 12;
};

export async function getMe(memberId: string, db: PrismaClient) {
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          payments: {
            where: { status: "FAILED" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  // Remove subscriptions from return to match MemberResponseSchema
  const { subscriptions, ...memberData } = member;

  return {
    ...memberData,
    subscriptionStatus: member.subscriptions[0]?.status ?? null,
    activePlanId: member.subscriptions[0]?.planId ?? null,
    adimplenciaStreak: member.adimplenciaStreakMonths,
  };
}

export async function updateMe(memberId: string, data: UpdateMemberProfileInput, db: PrismaClient) {
  // Passthrough in schema allows us to check if they sent forbidden fields
  const anyData = data as any;
  if (anyData.cpf !== undefined || anyData.email !== undefined) {
    throw new ForbiddenError("Cannot update CPF or email via this endpoint");
  }

  const member = await db.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  // Clean the data just in case
  const { name, phone, address, showOnMonument } = data;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (showOnMonument !== undefined) updateData.showOnMonument = showOnMonument;

  const updatedMember = await db.member.update({
    where: { id: memberId },
    data: updateData,
  });

  return updatedMember;
}

export async function generateMembershipCard(memberId: string, subscriptionId: string, db: PrismaClient) {
  await db.membershipCard.updateMany({
    where: { subscriptionId, isActive: true },
    data: { isActive: false }
  });

  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  const validUntil = subscription.currentPeriodEnd;

  const qrToken = await generateCardToken({
    memberId,
    planId: subscription.planId,
    tier: subscription.plan.name,
    validUntil: validUntil.toISOString(),
    status: "ACTIVE"
  });

  const card = await db.membershipCard.create({
    data: {
      memberId,
      subscriptionId,
      qrToken,
      validUntil,
      isActive: true,
    }
  });

  return card;
}

export async function getMemberReferral(memberId: string, db: PrismaClient) {
  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { referralCode: true },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  const referralCount = await db.gamificationEvent.count({
    where: {
      memberId,
      type: "REFERRAL",
    },
  });

  return {
    referralCode: member.referralCode,
    referralCount,
  };
}

export async function getMemberPayments(
  memberId: string,
  page: number,
  limit: number,
  db: PrismaClient
) {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where: {
        subscription: {
          memberId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    db.payment.count({
      where: {
        subscription: {
          memberId,
        },
      },
    }),
  ]);

  return {
    data: payments.map((p) => ({
      ...p,
      amount: Number(p.amount), // Convert Decimal to number for JSON response
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function listMembers(
  query: { page: number; limit: number; search?: string; status: string },
  db: PrismaClient
) {
  const { page, limit, search, status } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && status !== "ALL") {
    where.subscriptions = {
      some: { status },
    };
  }

  const [members, total] = await Promise.all([
    db.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true },
        },
      },
    }),
    db.member.count({ where }),
  ]);

  return {
    data: members.map((member) => {
      const { subscriptions, ...memberData } = member;
      return {
        ...memberData,
        subscriptionStatus: member.subscriptions[0]?.status ?? null,
        activePlanId: member.subscriptions[0]?.planId ?? null,
        activePlanName: member.subscriptions[0]?.plan?.name ?? null,
        adimplenciaStreak: member.adimplenciaStreakMonths,
        adminNotes: member.adminNotes,
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getMemberAdminDetail(id: string, db: PrismaClient) {
  const member = await db.member.findUnique({
    where: { id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      gamificationEvents: {
        orderBy: { createdAt: "desc" },
      },
      membershipCards: {
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  const { subscriptions, gamificationEvents, membershipCards, payments, ...memberData } = member;

  return {
    ...memberData,
    subscriptionStatus: subscriptions[0]?.status ?? null,
    activePlanId: subscriptions[0]?.planId ?? null,
    activePlanName: subscriptions[0]?.plan?.name ?? null,
    adimplenciaStreak: member.adimplenciaStreakMonths,
    adminNotes: member.adminNotes,
    subscriptions,
    gamificationEvents,
    membershipCards,
    payments,
  };
}

export async function updateAdminNotes(id: string, notes: string | null, db: PrismaClient) {
  const member = await db.member.findUnique({ where: { id } });
  if (!member) {
    throw new NotFoundError("Member not found");
  }

  return db.member.update({
    where: { id },
    data: { adminNotes: notes },
  });
}
