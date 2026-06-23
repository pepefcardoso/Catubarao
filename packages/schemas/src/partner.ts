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
  activeDealsCount: z.number().optional(),
});

// --- SPONSORSHIP DEAL ---
export const SponsorshipDealBaseSchema = z.object({
  partnerId: z.string().uuid(),
  type: DealTypeSchema,
  financialValue: z.number().optional().nullable(),
  startDate: z.union([z.string().date(), z.date()]),
  endDate: z.union([z.string().date(), z.date()]),
  status: DealStatusSchema,
  ownerId: z.string().uuid(),
  notes: z.string().optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
});

export const CreateSponsorshipDealSchema = SponsorshipDealBaseSchema.refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "endDate must be after startDate",
  path: ["endDate"],
});

export const CreateDealBodySchema = SponsorshipDealBaseSchema.omit({ partnerId: true }).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "endDate must be after startDate",
  path: ["endDate"],
});

export const UpdateSponsorshipDealSchema = SponsorshipDealBaseSchema.partial().refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: "endDate must be after startDate",
  path: ["endDate"],
});

export const CancelDealSchema = z.object({
  cancellationReason: z.string().min(1),
});

// --- DELIVERABLE ---
export const CreateDeliverableSchema = z.object({
  dealId: z.string().uuid(),
  description: z.string().min(1),
  frequency: DeliverableFrequencySchema,
  ownerId: z.string().uuid(),
});

export const CreateDeliverableBodySchema = CreateDeliverableSchema.omit({ dealId: true });

export const UpdateDeliverableSchema = CreateDeliverableSchema.omit({ dealId: true }).partial();

export const DeliverableResponseSchema = CreateDeliverableSchema.extend({
  id: z.string().uuid(),
});

export const PendingDeliveryResponseSchema = z.object({
  id: z.string().uuid(),
  deliverableId: z.string().uuid(),
  matchEventId: z.string().uuid().optional().nullable(),
  month: z.number().int().optional().nullable(),
  year: z.number().int().optional().nullable(),
  isFulfilled: z.boolean(),
  status: z.enum(["OVERDUE", "UPCOMING", "PENDING"]).optional(),
  createdAt: z.union([z.string(), z.date()]),
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

export const GenerateProofUploadUrlSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  filename: z.string().min(1),
});

export const UploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: z.string(),
});

export const CreateDeliveryProofBodySchema = CreateDeliveryProofSchema.omit({ deliverableId: true, createdBy: true });

// --- TYPES ---
export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof UpdatePartnerSchema>;
export type CreateSponsorshipDealInput = z.infer<typeof CreateSponsorshipDealSchema>;
export type CreateDealBodyInput = z.infer<typeof CreateDealBodySchema>;
export type UpdateSponsorshipDealInput = z.infer<typeof UpdateSponsorshipDealSchema>;
export type CancelDealInput = z.infer<typeof CancelDealSchema>;
export type CreateDeliverableInput = z.infer<typeof CreateDeliverableSchema>;
export type UpdateDeliverableInput = z.infer<typeof UpdateDeliverableSchema>;
export type CreateDeliveryProofInput = z.infer<typeof CreateDeliveryProofSchema>;
export type GenerateProofUploadUrlInput = z.infer<typeof GenerateProofUploadUrlSchema>;
export type CreateDeliveryProofBodyInput = z.infer<typeof CreateDeliveryProofBodySchema>;

export const SponsorshipDealResponseSchema = SponsorshipDealBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  deliverables: z.array(DeliverableResponseSchema).optional(),
});

export const SponsorshipDealWithPartnerResponseSchema = SponsorshipDealResponseSchema.extend({
  partner: PartnerResponseSchema,
});

export const PartnerWithDealsResponseSchema = PartnerResponseSchema.extend({
  deals: z.array(SponsorshipDealResponseSchema),
});

export const DeliverableWithDealResponseSchema = DeliverableResponseSchema.extend({
  deal: SponsorshipDealWithPartnerResponseSchema,
  owner: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export const PendingDeliveryWithDetailsResponseSchema = PendingDeliveryResponseSchema.extend({
  deliverable: DeliverableWithDealResponseSchema,
});

export const DeliveryProofWithDetailsResponseSchema = DeliveryProofResponseSchema.extend({
  deliverable: DeliverableWithDealResponseSchema,
  author: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
  }),
});
