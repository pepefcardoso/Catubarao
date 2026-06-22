import type { PrismaClient, GamificationEventType } from "@repo/db";
import { NotFoundError, ConflictError } from "../../lib/errors";

export async function recordGamificationEvent(
  memberId: string,
  type: GamificationEventType,
  db: PrismaClient,
  metadata?: any,
  idempotencyKey?: string
) {
  // 1. Fetch points for the rule
  const rule = await db.gamificationRule.findUnique({
    where: { type },
  });

  if (!rule || !rule.isActive) {
    throw new NotFoundError(`Gamification rule for ${type} not found or inactive`);
  }

  // 2. Prevent duplicates if idempotency key is provided
  if (idempotencyKey) {
    const existing = await db.gamificationEvent.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing; // Return without duplicating
    }
  }

  // 3. Create the event
  try {
    return await db.gamificationEvent.create({
      data: {
        memberId,
        type,
        points: rule.points,
        metadata: metadata || null,
        idempotencyKey: idempotencyKey || null,
      },
    });
  } catch (error: any) {
    // Unique constraint violation on idempotencyKey
    if (error.code === 'P2002' && idempotencyKey) {
      const existing = await db.gamificationEvent.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing;
    }
    throw error;
  }
}

export async function getMemberPoints(memberId: string, db: PrismaClient) {
  const events = await db.gamificationEvent.findMany({
    where: { memberId },
    select: { type: true, points: true },
  });

  let totalPoints = 0;
  const breakdownMap: Record<string, number> = {};

  for (const event of events) {
    totalPoints += event.points;
    breakdownMap[event.type] = (breakdownMap[event.type] || 0) + event.points;
  }

  const breakdown = Object.entries(breakdownMap).map(([type, points]) => ({
    type: type as GamificationEventType,
    points,
  }));

  return { totalPoints, breakdown };
}

export async function getLeaderboard(limit: number, db: PrismaClient) {
  const leaderboardRaw = await db.$queryRaw<
    Array<{ memberId: string; name: string; totalPoints: number }>
  >\`
    SELECT 
      m.id as "memberId", 
      m.name, 
      COALESCE(SUM(g.points), 0)::int as "totalPoints"
    FROM members m
    LEFT JOIN gamification_events g ON m.id = g."memberId"
    WHERE m."showOnLeaderboard" = true
    GROUP BY m.id, m.name
    ORDER BY "totalPoints" DESC
    LIMIT \${limit}
  \`;

  return leaderboardRaw.map((entry, index) => ({
    memberId: entry.memberId,
    name: entry.name,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}
