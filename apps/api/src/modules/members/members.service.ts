import type { PrismaClient } from "@repo/db";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import type { UpdateMemberProfileSchema } from "@repo/schemas/member";
import type { z } from "zod";

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
