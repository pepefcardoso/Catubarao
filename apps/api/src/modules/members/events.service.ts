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

export async function getUpcomingEventForMember(memberId: string, db: PrismaClient) {
  const now = new Date();
  const brazilOffset = -3 * 60 * 60 * 1000;
  const todayBR = new Date(now.getTime() + brazilOffset);
  const todayStart = new Date(Date.UTC(todayBR.getUTCFullYear(), todayBR.getUTCMonth(), todayBR.getUTCDate()));
  const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const h48Ago     = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // 1. Candidate events in one query
  const [todayEvent, recentPastEvent, nextFutureEvent] = await Promise.all([
    db.matchEvent.findFirst({ where: { date: { gte: todayStart, lt: todayEnd } }, orderBy: { date: "asc" } }),
    db.matchEvent.findFirst({ where: { date: { gte: h48Ago, lt: todayStart } }, orderBy: { date: "desc" } }),
    db.matchEvent.findFirst({ where: { date: { gte: todayEnd } }, orderBy: { date: "asc" } }),
  ]);

  // 2. Base check-in points from rule table
  const rule = await db.gamificationRule.findUnique({ where: { type: "CHECKIN" } });
  const baseCheckinPoints = rule?.points ?? 50;

  // 3. Determine state + relevant event
  let state: "MATCHDAY" | "PREMATCH" | "POSTMATCH" | null = null;
  let event: typeof todayEvent | null = null;

  if (todayEvent)       { state = "MATCHDAY";  event = todayEvent; }
  else if (recentPastEvent) { state = "POSTMATCH"; event = recentPastEvent; }
  else if (nextFutureEvent) { state = "PREMATCH";  event = nextFutureEvent; }

  // 4. Member check-in for this event (POSTMATCH only)
  let memberCheckin: { points: number; createdAt: string } | null = null;
  if (state === "POSTMATCH" && event) {
    const checkin = await db.gamificationEvent.findUnique({
      where: { idempotencyKey: `CHECKIN_${memberId}_${event.id}` },
    });
    if (checkin) {
      memberCheckin = { points: checkin.points, createdAt: checkin.createdAt.toISOString() };
    }
  }

  // 5. Streak — look at past MatchEvents (most recent first, limit 30 for perf)
  const pastEvents = await db.matchEvent.findMany({
    where: { date: { lt: todayEnd } },
    orderBy: { date: "desc" },
    take: 30,
    select: { id: true },
  });
  
  const checkinKeys = pastEvents.map(e => `CHECKIN_${memberId}_${e.id}`);
  
  const existingCheckins = await db.gamificationEvent.findMany({
    where: { idempotencyKey: { in: checkinKeys } },
    select: { idempotencyKey: true },
  });
  
  const checkedInKeys = new Set(existingCheckins.map(e => e.idempotencyKey));
  
  let checkinStreak = 0;
  for (const pe of pastEvents) {
    if (checkedInKeys.has(`CHECKIN_${memberId}_${pe.id}`)) {
      checkinStreak++;
    } else {
      break;
    }
  }

  return { state, event, baseCheckinPoints, memberCheckin, checkinStreak };
}
