import type { PrismaClient } from "@repo/db";
import type { CreatePartnerInput, UpdatePartnerInput } from "@repo/schemas/partner";
import { NotFoundError } from "../../lib/errors";

export async function getPartners(db: PrismaClient, query: { page: number; limit: number; status?: "PROSPECT" | "ACTIVE" | "INACTIVE" | "CANCELLED" }) {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [partners, total] = await Promise.all([
    db.partner.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.partner.count({ where }),
  ]);

  return {
    partners,
    total,
    page,
    limit,
  };
}

export async function getPartnerById(id: string, db: PrismaClient) {
  const partner = await db.partner.findUnique({
    where: { id },
    include: { deals: true },
  });

  if (!partner) {
    throw new NotFoundError("Partner not found");
  }

  return partner;
}

export async function createPartner(input: CreatePartnerInput, db: PrismaClient) {
  return db.partner.create({
    data: {
      ...input,
    },
  });
}

export async function updatePartner(id: string, input: UpdatePartnerInput, db: PrismaClient) {
  const partner = await db.partner.findUnique({ where: { id } });
  if (!partner) {
    throw new NotFoundError("Partner not found");
  }

  return db.partner.update({
    where: { id },
    data: {
      ...input,
    },
  });
}

export async function deletePartner(id: string, db: PrismaClient) {
  const partner = await db.partner.findUnique({ where: { id } });
  if (!partner) {
    throw new NotFoundError("Partner not found");
  }

  return db.partner.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
