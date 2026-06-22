import type { PrismaClient } from "@repo/db";
import type { CreateMatchEventInput } from "@repo/schemas/events";

export async function createMatchEvent(data: CreateMatchEventInput, db: PrismaClient) {
  return db.matchEvent.create({
    data: {
      date: new Date(data.date),
      opponent: data.opponent,
      competition: data.competition,
    },
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
