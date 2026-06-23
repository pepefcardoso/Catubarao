import { z } from "zod";

export const TransparencyCategorySchema = z.enum([
  "BALANCO_MENSAL",
  "STATUS_DIVIDAS",
  "ATA_ASSEMBLEIA",
  "COMPOSICAO_SOCIETARIA",
  "DOCUMENTO_SAF",
  "OUTRO",
]);

export const DebtStatusSchema = z.enum([
  "EM_NEGOCIACAO",
  "EM_DIA",
  "ATRASADO",
  "QUITADO",
]);

export const CreateTransparencyPostBaseSchema = z.object({
  title: z.string().min(1).max(255),
  category: TransparencyCategorySchema,
  referenceMonth: z.number().int().min(1).max(12).optional().nullable(),
  referenceYear: z.number().int().min(2000).max(2100).optional().nullable(),
  body: z.string().min(1),
  attachmentUrl: z.string().url().optional().nullable(),
  publishedAt: z.union([z.string(), z.date()]),
  scheduledFor: z.union([z.string(), z.date()]).optional().nullable(),
  supersededById: z.string().uuid().optional().nullable(),
});

export const CreateTransparencyPostSchema = CreateTransparencyPostBaseSchema.superRefine(
  (data, ctx) => {
    if (data.category === "BALANCO_MENSAL" || data.category === "STATUS_DIVIDAS") {
      if (data.referenceMonth == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "referenceMonth is required for BALANCO_MENSAL and STATUS_DIVIDAS",
          path: ["referenceMonth"],
        });
      }
      if (data.referenceYear == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "referenceYear is required for BALANCO_MENSAL and STATUS_DIVIDAS",
          path: ["referenceYear"],
        });
      }
    }
  }
);

export type CreateTransparencyPostInput = z.infer<typeof CreateTransparencyPostSchema>;

export const TransparencyPostResponseSchema = CreateTransparencyPostBaseSchema.extend({
  id: z.string().uuid(),
  version: z.number().int(),
  isArchived: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export type TransparencyPostResponse = z.infer<typeof TransparencyPostResponseSchema>;

export const CreateDebtRecordSchema = z.object({
  creditorName: z.string().min(1).max(255),
  creditorGroup: z.string().max(255).optional().nullable(),
  originalAmount: z.number().nonnegative(),
  negotiatedAmount: z.number().nonnegative().optional().nullable(),
  paidAmount: z.number().nonnegative().default(0),
  status: DebtStatusSchema,
  publicNote: z.string().optional().nullable(),
});

export type CreateDebtRecordInput = z.infer<typeof CreateDebtRecordSchema>;

export const UpdateDebtRecordSchema = CreateDebtRecordSchema.partial();

export type UpdateDebtRecordInput = z.infer<typeof UpdateDebtRecordSchema>;

export const DebtRecordResponseSchema = CreateDebtRecordSchema.extend({
  id: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export type DebtRecordResponse = z.infer<typeof DebtRecordResponseSchema>;

export const CreateDebtSnapshotSchema = z.object({
  totalOriginal: z.number().nonnegative(),
  totalNegotiated: z.number().nonnegative(),
  totalPaid: z.number().nonnegative(),
  totalRemaining: z.number().nonnegative(),
  snapshotDate: z.union([z.string(), z.date()]),
});

export type CreateDebtSnapshotInput = z.infer<typeof CreateDebtSnapshotSchema>;

export const DebtSnapshotResponseSchema = CreateDebtSnapshotSchema.extend({
  id: z.string().uuid(),
  snapshotDate: z.union([z.string(), z.date()]),
  createdBy: z.string().uuid().optional().nullable(),
  createdAt: z.union([z.string(), z.date()]),
});

export type DebtSnapshotResponse = z.infer<typeof DebtSnapshotResponseSchema>;
