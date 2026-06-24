import type { PrismaClient } from "@repo/db";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import type { UpdateMemberProfileSchema } from "@repo/schemas/member";
import type { z } from "zod";
import { generateCardToken } from "../../lib/qr";
import { cancelSubscription } from "./subscriptions.service";
import crypto from "crypto";

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

  const memberNumber = await db.member.count({
    where: { createdAt: { lte: member.createdAt } }
  });

  return {
    ...memberData,
    subscriptionStatus: member.subscriptions[0]?.status ?? null,
    activePlanId: member.subscriptions[0]?.planId ?? null,
    adimplenciaStreak: member.adimplenciaStreakMonths,
    memberNumber,
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

  const referralEvents = await db.gamificationEvent.findMany({
    where: {
      memberId,
      type: "REFERRAL",
    },
    select: { points: true }
  });

  const successfulReferrals = referralEvents.length;
  const pointsEarned = referralEvents.reduce((sum, event) => sum + event.points, 0);

  return {
    code: member.referralCode,
    successfulReferrals,
    pointsEarned,
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
  query: { page: number; limit: number; search?: string; status: string; role?: string },
  db: PrismaClient
) {
  const { page, limit, search, status, role } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
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
    },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  const { subscriptions, gamificationEvents, membershipCards, ...memberData } = member;

  const payments = await db.payment.findMany({
    where: { subscription: { memberId: id } },
    orderBy: { createdAt: "desc" },
  });

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

export async function exportMemberData(memberId: string, db: PrismaClient) {
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: {
      subscriptions: {
        include: {
          payments: true,
          plan: true,
        },
      },
      orders: {
        include: {
          items: true,
          payments: true,
        },
      },
      gamificationEvents: true,
    },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  await db.auditLog.create({
    data: {
      action: "DATA_EXPORT",
      memberId,
      performedBy: memberId,
    },
  });

  return member;
}

export async function anonymizeMember(memberId: string, db: PrismaClient) {
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
      },
    },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  // Cancel active subscriptions via MP API
  for (const sub of member.subscriptions) {
    await cancelSubscription(sub.id, db);
  }

  // Anonymize the member profile
  const anonymizedEmail = crypto.createHash("sha256").update(member.email).digest("hex");
  const anonymizedCpf = member.cpf ? crypto.createHash("sha256").update(member.cpf).digest("hex") : null;

  await db.$transaction(async (tx) => {
    await tx.member.update({
      where: { id: memberId },
      data: {
        name: "Sócio Removido",
        email: anonymizedEmail,
        cpf: anonymizedCpf,
        phone: null,
        address: null,
        birthDate: null,
        image: null,
        referralCode: null,
        isAnonymized: true,
        isActive: false,
      },
    });

    await tx.session.deleteMany({
      where: { userId: memberId },
    });

    await tx.account.deleteMany({
      where: { userId: memberId },
    });

    await tx.auditLog.create({
      data: {
        action: "ACCOUNT_ANONYMIZED",
        memberId,
        performedBy: memberId,
      },
    });
  });

  return { success: true };
}
