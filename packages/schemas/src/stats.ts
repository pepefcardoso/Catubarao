import { z } from "zod";

export const CreateGoalSchema = z.object({
  label: z.string().min(1).max(255),
  target: z.number().int().positive(),
  metric: z.string().min(1).max(100),
});

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;

export const GoalResponseSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  target: z.number().int(),
  metric: z.string(),
  createdAt: z.string().or(z.date()),
});

export type GoalResponse = z.infer<typeof GoalResponseSchema>;

export const StatsMembersResponseSchema = z.object({
  total: z.number().int(),
  byTier: z.array(z.object({
    planId: z.string(),
    planName: z.string(),
    count: z.number().int(),
  })),
  goals: z.array(GoalResponseSchema),
});

export type StatsMembersResponse = z.infer<typeof StatsMembersResponseSchema>;

export const RecentMemberResponseSchema = z.object({
  firstName: z.string(),
  city: z.string().optional(),
  joinedAt: z.string(),
});

export type RecentMemberResponse = z.infer<typeof RecentMemberResponseSchema>;

export const RecentMembersResponseSchema = z.array(RecentMemberResponseSchema);

export type RecentMembersResponse = z.infer<typeof RecentMembersResponseSchema>;
