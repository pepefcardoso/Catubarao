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

  return db.$transaction(async (tx) => {
    const deliverable = await tx.deliverable.create({
      data: {
        ...input,
        dealId,
      },
    });

    if (input.frequency === "MENSAL") {
      const start = new Date(deal.startDate);
      const end = new Date(deal.endDate);
      const pendingDeliveries = [];

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endLimit) {
        pendingDeliveries.push({
          deliverableId: deliverable.id,
          month: current.getMonth() + 1,
          year: current.getFullYear(),
        });
        current.setMonth(current.getMonth() + 1);
      }

      if (pendingDeliveries.length > 0) {
        await tx.pendingDelivery.createMany({
          data: pendingDeliveries,
        });
      }
    }

    return deliverable;
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
      deliverable: {
        include: {
          deal: {
            include: { partner: true }
          },
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      matchEvent: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();

  const withStatus = pending.map((p) => {
    let status: "PENDING" | "OVERDUE" | "UPCOMING" = "PENDING";

    if (p.matchEvent) {
      if (p.matchEvent.date < now) {
        status = "OVERDUE";
      } else {
        status = "UPCOMING";
      }
    } else if (p.month && p.year) {
      const isPastMonth = p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth() + 1);
      const isCurrentMonth = p.year === now.getFullYear() && p.month === now.getMonth() + 1;
      
      if (isPastMonth) status = "OVERDUE";
      else if (isCurrentMonth) status = "PENDING";
      else status = "UPCOMING";
    }

    return {
      ...p,
      status,
    };
  });

  return withStatus.filter((p) => p.status !== "UPCOMING");
}

export async function getCompletedDeliveries(db: PrismaClient) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return db.deliveryProof.findMany({
    where: {
      deliveredAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      deliverable: {
        include: {
          deal: {
            include: { partner: true }
          },
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      author: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { deliveredAt: "desc" },
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

  return db.$transaction(async (tx) => {
    const proof = await tx.deliveryProof.create({
      data: {
        ...input,
        deliverableId,
        createdBy: userId,
      },
    });

    // Attempt to fulfill the corresponding PendingDelivery
    const deliveredDate = new Date(input.deliveredAt);
    
    if (input.matchEventId) {
      await tx.pendingDelivery.updateMany({
        where: { deliverableId, matchEventId: input.matchEventId, isFulfilled: false },
        data: { isFulfilled: true }
      });
    } else {
      // Find the oldest unfulfilled pending delivery for this deliverable
      // that matches the month/year of the delivery or just any unfulfilled if unique
      const pending = await tx.pendingDelivery.findFirst({
        where: { deliverableId, isFulfilled: false },
        orderBy: { createdAt: "asc" }
      });

      if (pending) {
        await tx.pendingDelivery.update({
          where: { id: pending.id },
          data: { isFulfilled: true }
        });
      }
    }

    return proof;
  });
}
