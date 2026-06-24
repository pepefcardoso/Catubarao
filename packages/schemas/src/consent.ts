import { z } from "zod";

export const ConsentChoicesSchema = z.object({
  all: z.boolean().optional(),
  essential: z.boolean().optional(),
});

export const CreateConsentSchema = z.object({
  choices: ConsentChoicesSchema,
});

export type ConsentChoices = z.infer<typeof ConsentChoicesSchema>;
export type CreateConsentInput = z.infer<typeof CreateConsentSchema>;
