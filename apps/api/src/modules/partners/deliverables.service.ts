import type { PrismaClient } from "@repo/db";
import type { CreateDeliverableInput, UpdateDeliverableInput, GenerateProofUploadUrlInput, CreateDeliveryProofBodyInput } from "@repo/schemas/partner";
import { NotFoundError } from "../../lib/errors";
import { buildStorageKey, getUploadUrl } from "../../lib/storage";
import { randomUUID } from "node:crypto";

export async function createDeliverable(dealId: string, input: Omit<CreateDeliverableInput, "dealId">, db: PrismaClient) {
  const deal = await db.sponsorshipDeal.findUnique({ where: { id: dealId } });
  if (!deal) {
    throw new NotFoundError("Sponsorship deal not found");
  }

  return db.deliverable.create({
    data: {
      ...input,
      dealId,
    },
  });
}

export async function updateDeliverable(id: string, input: UpdateDeliverableInput, db: PrismaClient) {
  const deliverable = await db.deliverable.findUnique({ where: { id } });
  if (!deliverable) {
    throw new NotFoundError("Deliverable not found");
  }

  return db.deliverable.update({
    where: { id },
    data: input,
  });
}

export async function getPendingDeliveries(db: PrismaClient) {
  const pending = await db.pendingDelivery.findMany({
    where: { isFulfilled: false },
    include: {
      deliverable: true,
      matchEvent: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();

  return pending.map((p) => {
    let status: "PENDING" | "OVERDUE" | "UPCOMING" = "PENDING";

    if (p.matchEvent) {
      if (p.matchEvent.date < now) {
        status = "OVERDUE";
      } else {
        status = "UPCOMING";
      }
    } else if (p.month && p.year) {
      const isPastMonth = p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth() + 1);
      status = isPastMonth ? "OVERDUE" : "UPCOMING";
    }

    return {
      ...p,
      status,
    };
  });
}

export async function generateProofUploadUrl(deliverableId: string, input: GenerateProofUploadUrlInput, db: PrismaClient) {
  const deliverable = await db.deliverable.findUnique({ where: { id: deliverableId } });
  if (!deliverable) {
    throw new NotFoundError("Deliverable not found");
  }

  const proofId = randomUUID();
  const key = buildStorageKey("partners", proofId, input.filename);
  const uploadUrl = await getUploadUrl(key, input.contentType);

  return { uploadUrl, key };
}

export async function createDeliveryProof(
  deliverableId: string,
  userId: string,
  input: CreateDeliveryProofBodyInput,
  db: PrismaClient
) {
  const deliverable = await db.deliverable.findUnique({ where: { id: deliverableId } });
  if (!deliverable) {
    throw new NotFoundError("Deliverable not found");
  }

  return db.deliveryProof.create({
    data: {
      ...input,
      deliverableId,
      createdBy: userId,
    },
  });
}
