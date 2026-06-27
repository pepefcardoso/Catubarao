import { z } from "zod";

export const CreateTestimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  text: z.string().min(1, "Text is required"),
  tier: z.string().optional(),
  photoUrl: z.string().url("Invalid URL").optional(),
  source: z.string().optional(),
  isApproved: z.boolean().optional(),
});

export const UpdateTestimonialSchema = CreateTestimonialSchema.partial();

export const TestimonialResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string(),
  tier: z.string().nullable(),
  photoUrl: z.string().nullable(),
  isApproved: z.boolean(),
  source: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type CreateTestimonialInput = z.infer<typeof CreateTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof UpdateTestimonialSchema>;
export type TestimonialResponse = z.infer<typeof TestimonialResponseSchema>;
