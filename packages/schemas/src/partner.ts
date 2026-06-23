import { z } from "zod";

// --- ENUMS ---
export const PartnerStatusSchema = z.enum(["PROSPECT", "ACTIVE", "INACTIVE", "CANCELLED"]);
export const DealTypeSchema = z.enum(["FINANCEIRO", "PERMUTA", "MISTO"]);
export const DealStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
export const DeliverableFrequencySchema = z.enum(["UNICO", "POR_JOGO", "MENSAL"]);
export const EvidenceTypeSchema = z.enum(["FOTO", "PRINT_POST", "LINK", "NOTA"]);

// --- PARTNER ---
export const CreatePartnerSchema = z.object({
  legalName: z.string().min(1),
  tradeName: z.string().min(1),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ must be exactly 14 digits").optional().nullable(),
  segment: z.string().min(1),
  status: PartnerStatusSchema,
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export const UpdatePartnerSchema = CreatePartnerSchema.partial();

export const PartnerResponseSchema = CreatePartnerSchema.extend({
  id: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

// --- SPONSORSHIP DEAL ---
export const CreateSponsorshipDealSchema = z.object({
  partnerId: z.string().uuid(),
  type: DealTypeSchema,
  financialValue: z.number().optional().nullable(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  status: DealStatusSchema,
  ownerId: z.string().uuid(),
  notes: z.string().optional().nullable(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "endDate must be after startDate",
  path: ["endDate"],
});

// --- DELIVERABLE ---
export const CreateDeliverableSchema = z.object({
  dealId: z.string().uuid(),
  description: z.string().min(1),
  frequency: DeliverableFrequencySchema,
  ownerId: z.string().uuid(),
});

export const DeliverableResponseSchema = CreateDeliverableSchema.extend({
  id: z.string().uuid(),
});

// --- DELIVERY PROOF ---
export const CreateDeliveryProofSchema = z.object({
  deliverableId: z.string().uuid(),
  matchEventId: z.string().uuid().optional().nullable(),
  deliveredAt: z.string().date(),
  evidenceType: EvidenceTypeSchema,
  fileUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdBy: z.string().uuid(),
});

export const DeliveryProofResponseSchema = CreateDeliveryProofSchema.extend({
  id: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
});

// --- TYPES ---
export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof UpdatePartnerSchema>;
export type CreateSponsorshipDealInput = z.infer<typeof CreateSponsorshipDealSchema>;
export type CreateDeliverableInput = z.infer<typeof CreateDeliverableSchema>;
export type CreateDeliveryProofInput = z.infer<typeof CreateDeliveryProofSchema>;
