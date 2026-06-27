import { z } from "zod";

export const BannerTypeSchema = z.enum(["ANNOUNCEMENT", "BADGE", "MILESTONE"]);

export const CreateAnnouncementBannerSchema = z.object({
  type: BannerTypeSchema.default("ANNOUNCEMENT"),
  text: z.string().min(1).max(255),
  link: z.string().url().nullable().optional(),
  color: z.string().default("brand-primary"),
  isActive: z.boolean().default(true),
  expiresAt: z.union([z.string(), z.date()]).nullable().optional(),
});

export type CreateAnnouncementBannerInput = z.infer<typeof CreateAnnouncementBannerSchema>;

export const AnnouncementBannerResponseSchema = z.object({
  id: z.string().cuid(),
  type: BannerTypeSchema,
  text: z.string(),
  link: z.string().nullable().optional(),
  color: z.string(),
  isActive: z.boolean(),
  expiresAt: z.union([z.string(), z.date()]).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export type AnnouncementBannerResponse = z.infer<typeof AnnouncementBannerResponseSchema>;
