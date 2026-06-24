import { z } from "zod";

export const WaitlistEntrySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  source: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const CreateWaitlistEntrySchema = z.object({
  email: z.string().email("E-mail inválido"),
  source: z.string().min(1),
});

export const WaitlistListResponseSchema = z.array(WaitlistEntrySchema);

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;
export type CreateWaitlistEntryInput = z.infer<typeof CreateWaitlistEntrySchema>;
