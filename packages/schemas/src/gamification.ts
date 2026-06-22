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

export const MemberPointsResponseSchema = z.object({
  totalPoints: z.number().int().nonnegative(),
  breakdown: z.array(
    z.object({
      type: z.enum(["CHECKIN", "REFERRAL", "ANNIVERSARY", "STREAK_6M", "STREAK_12M"]),
      points: z.number().int().nonnegative(),
    })
  ),
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
