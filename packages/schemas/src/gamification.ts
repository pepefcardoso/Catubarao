import { z } from "zod";

export const GamificationRuleSchema = z.object({
  type: z.enum(["CHECKIN", "REFERRAL", "ANNIVERSARY", "STREAK_6M", "STREAK_12M"]),
  points: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
});

export const GamificationEventSchema = z.object({
  type: z.enum(["CHECKIN", "REFERRAL", "ANNIVERSARY", "STREAK_6M", "STREAK_12M"]),
  points: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime(),
});

export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isUnlocked: z.boolean(),
  unlockedAt: z.string().datetime().optional()
});

export const MemberPointsResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  rank: z.number().int().positive().nullable(),
  recentEvents: z.array(GamificationEventSchema),
  badges: z.array(BadgeSchema),
});

export const LeaderboardEntrySchema = z.object({
  memberId: z.string().uuid(),
  name: z.string(),
  totalPoints: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
});

export const LeaderboardResponseSchema = z.array(LeaderboardEntrySchema);

export const CheckinBodySchema = z.object({
  token: z.string(),
});

export const BulkCheckinBodySchema = z.object({
  checkins: z.array(
    z.object({
      token: z.string(),
      timestamp: z.number(),
    })
  ).max(500),
});
