import { z } from "zod";

export const MercadoPagoWebhookSchema = z.object({
  action: z.string().optional(),
  api_version: z.string().optional(),
  data: z.object({
    id: z.string().or(z.number()).transform(val => String(val)),
  }),
  date_created: z.string().optional(),
  id: z.number().or(z.string()).optional(),
  live_mode: z.boolean().optional(),
  type: z.string(),
  user_id: z.number().or(z.string()).optional(),
});

export type MercadoPagoWebhookInput = z.infer<typeof MercadoPagoWebhookSchema>;
