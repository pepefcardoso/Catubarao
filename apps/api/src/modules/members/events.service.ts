import type { PrismaClient } from "@repo/db";
import type { CreateMatchEventInput } from "@repo/schemas/events";

export async function createMatchEvent(data: CreateMatchEventInput, db: PrismaClient) {
  return db.$transaction(async (tx) => {
    const event = await tx.matchEvent.create({
      data: {
        date: new Date(data.date),
        opponent: data.opponent,
        competition: data.competition,
      },
    });

    const activeDeals = await tx.sponsorshipDeal.findMany({
      where: { status: "ACTIVE" },
      include: {
        deliverables: {
          where: { frequency: "POR_JOGO" },
        },
      },
    });

    const pendingDeliveries = [];
    for (const deal of activeDeals) {
      for (const deliverable of deal.deliverables) {
        pendingDeliveries.push({
          deliverableId: deliverable.id,
          matchEventId: event.id,
        });
      }
    }

    if (pendingDeliveries.length > 0) {
      await tx.pendingDelivery.createMany({
        data: pendingDeliveries,
      });
    }

    return event;
  });
}

export async function listMatchEvents(page: number, limit: number, db: PrismaClient) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    db.matchEvent.findMany({
      skip,
      take: limit,
      orderBy: { date: "desc" },
    }),
    db.matchEvent.count(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
