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
  const recentEvents = await db.gamificationEvent.findMany({
    where: { memberId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const totalPointsRes = await db.gamificationEvent.aggregate({
    where: { memberId },
    _sum: { points: true }
  });
  const total = totalPointsRes._sum.points || 0;

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { showOnLeaderboard: true }
  });

  let rank: number | null = null;
  if (member?.showOnLeaderboard) {
    const rankRaw = await db.$queryRaw<Array<{ rank: bigint }>>`
      WITH RankedMembers AS (
        SELECT 
          m.id, 
          RANK() OVER (ORDER BY COALESCE(SUM(g.points), 0) DESC) as rank
        FROM members m
        LEFT JOIN gamification_events g ON m.id = g."memberId"
        WHERE m."showOnLeaderboard" = true
        GROUP BY m.id
      )
      SELECT rank FROM RankedMembers WHERE id = ${memberId}
    `;
    if (rankRaw.length > 0) {
      rank = Number(rankRaw[0].rank);
    }
  }

  const checkinCount = await db.gamificationEvent.count({
    where: { memberId, type: 'CHECKIN' }
  });
  
  const referralCount = await db.gamificationEvent.count({
    where: { memberId, type: 'REFERRAL' }
  });
  
  const streak12m = await db.gamificationEvent.findFirst({
    where: { memberId, type: 'STREAK_12M' }
  });
  
  const voteCount = await db.pollVote.count({
    where: { memberId }
  });

  const badges = [
    {
      id: "first_checkin",
      name: "1º Check-in",
      description: "Compareceu ao seu primeiro jogo.",
      isUnlocked: checkinCount > 0,
    },
    {
      id: "five_referrals",
      name: "Embaixador",
      description: "Indicou 5 novos sócios.",
      isUnlocked: referralCount >= 5,
    },
    {
      id: "streak_12m",
      name: "Sócio Fiel 12M",
      description: "12 meses de adimplência.",
      isUnlocked: !!streak12m,
    },
    {
      id: "first_vote",
      name: "Voz Ativa",
      description: "Participou de uma votação.",
      isUnlocked: voteCount > 0,
    }
  ];

  return { total, rank, recentEvents: recentEvents.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString()
  })), badges };
}

export async function getLeaderboard(limit: number, db: PrismaClient) {
  const leaderboardRaw = await db.$queryRaw<
    Array<{ memberId: string; name: string; totalPoints: number; memberSince: number }>
  >`
    SELECT 
      m.id as "memberId", 
      m.name, 
      EXTRACT(YEAR FROM m."createdAt")::int as "memberSince",
      COALESCE(SUM(g.points), 0)::int as "totalPoints"
    FROM members m
    LEFT JOIN gamification_events g ON m.id = g."memberId"
    WHERE m."showOnLeaderboard" = true
    GROUP BY m.id, m.name, m."createdAt"
    ORDER BY "totalPoints" DESC
    LIMIT ${limit}
  `;

  const cutoff = process.env.FOUNDER_CUTOFF_DATE ? new Date(process.env.FOUNDER_CUTOFF_DATE) : null;

  return await Promise.all(
    leaderboardRaw.map(async (entry, index) => {
      const activeSub = await db.subscription.findFirst({
        where: { memberId: entry.memberId, status: "ACTIVE" },
        orderBy: { createdAt: 'desc' },
        include: { plan: true }
      });

      const firstSub = await db.subscription.findFirst({
        where: { memberId: entry.memberId },
        orderBy: { createdAt: 'asc' }
      });

      let isFounder = false;
      if (cutoff && firstSub && firstSub.createdAt < cutoff) {
        isFounder = true;
      }

      return {
        memberId: entry.memberId,
        name: entry.name,
        totalPoints: entry.totalPoints,
        rank: index + 1,
        tier: activeSub?.plan?.name ?? "Sócio",
        memberSince: entry.memberSince,
        isFounder
      };
    })
  );
}
