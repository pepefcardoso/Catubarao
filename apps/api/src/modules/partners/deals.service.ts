import type { PrismaClient } from "@repo/db";
import type { CreateDealBodyInput, UpdateSponsorshipDealInput, CancelDealInput } from "@repo/schemas/partner";
import { NotFoundError } from "../../lib/errors";

export async function getDealsByPartner(partnerId: string, db: PrismaClient) {
  return db.sponsorshipDeal.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDeal(partnerId: string, input: CreateDealBodyInput, db: PrismaClient) {
  const partner = await db.partner.findUnique({ where: { id: partnerId } });
  if (!partner) {
    throw new NotFoundError("Partner not found");
  }

  return db.sponsorshipDeal.create({
    data: {
      ...input,
      partnerId,
    },
  });
}

export async function updateDeal(id: string, input: UpdateSponsorshipDealInput, db: PrismaClient) {
  const deal = await db.sponsorshipDeal.findUnique({ where: { id } });
  if (!deal) {
    throw new NotFoundError("Deal not found");
  }

  return db.sponsorshipDeal.update({
    where: { id },
    data: {
      ...input,
    },
  });
}

export async function cancelDeal(id: string, input: CancelDealInput, db: PrismaClient) {
  const deal = await db.sponsorshipDeal.findUnique({ where: { id } });
  if (!deal) {
    throw new NotFoundError("Deal not found");
  }

  return db.sponsorshipDeal.update({
    where: { id },
    data: { 
      status: "CANCELLED",
      cancellationReason: input.cancellationReason
    },
  });
}

export async function getExpiringDeals(days: number, db: PrismaClient) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);

  return db.sponsorshipDeal.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: today,
        lte: futureDate,
      },
    },
    include: {
      partner: true,
    },
    orderBy: { endDate: "asc" },
  });
}

export async function getDealWithProofs(id: string, db: PrismaClient) {
  const deal = await db.sponsorshipDeal.findUnique({
    where: { id },
    include: {
      partner: true,
      deliverables: {
        include: {
          proofs: {
            orderBy: { deliveredAt: "desc" },
          },
        },
      },
    },
  });

  if (!deal) {
    throw new NotFoundError("Deal not found");
  }

  return deal;
}
