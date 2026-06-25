import { z } from "zod";

export const CreateMatchEventSchema = z.object({
  date: z.coerce.date(),
  opponent: z.string().min(2),
  competition: z.string().min(2),
});

export type CreateMatchEventInput = z.infer<typeof CreateMatchEventSchema>;

export const MatchEventResponseSchema = z.object({
  id: z.string(),
  date: z.date(),
  opponent: z.string(),
  competition: z.string(),
  createdAt: z.date(),
});

export const PaginatedMatchEventsResponseSchema = z.object({
  data: z.array(MatchEventResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const UpcomingEventResponseSchema = z.object({
  state: z.enum(["PREMATCH", "MATCHDAY", "POSTMATCH"]).nullable(),
  event: MatchEventResponseSchema.nullable(),
  baseCheckinPoints: z.number().int(),
  memberCheckin: z
    .object({ points: z.number().int(), createdAt: z.string() })
    .nullable(),
  checkinStreak: z.number().int(),
});

export type UpcomingEventResponse = z.infer<typeof UpcomingEventResponseSchema>;
