import { z } from "zod";
import { AddressSchema } from "./common";

const isCpfValid = (cpf: string) => {
  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  return true;
};

const normalizePhone = (phone: string) => {
  if (phone.startsWith("+")) return phone;

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }
  return `+${digits}`;
};

export const CreateMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  cpf: z
    .string()
    .refine(isCpfValid, { message: "Invalid CPF. Must be 11 digits and not a repeated sequence." }),
  phone: z
    .string()
    .min(10)
    .max(20)
    .transform(normalizePhone)
    .refine((val: string) => /^\+[1-9]\d{1,14}$/.test(val), { message: "Invalid phone number format" }),
  birthDate: z.coerce.date(),
  referralCode: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  whatsappOptIn: z.boolean().default(false),
  address: AddressSchema.optional(),
  showOnMonument: z.boolean().default(false),
  showOnLeaderboard: z.boolean().default(false),
});

export const UpdateMemberSchema = CreateMemberSchema.partial().extend({
  cpf: z
    .string()
    .refine(isCpfValid, { message: "Invalid CPF. Must be 11 digits and not a repeated sequence." })
    .optional(),
});

export const RegisterMemberSchema = CreateMemberSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterMemberInput = z.infer<typeof RegisterMemberSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const MemberResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.date().nullable(),
  cpf: z.string().nullable(),
  phone: z.string().nullable(),
  birthDate: z.date().nullable(),
  referralCode: z.string().nullable(),
  isActive: z.boolean(),
  marketingConsent: z.boolean(),
  whatsappOptIn: z.boolean(),
  whatsappOptInDismissedAt: z.date().nullable(),
  showOnMonument: z.boolean(),
  showOnLeaderboard: z.boolean(),
  memberNumber: z.number().int(),
  address: AddressSchema.nullable(),
  referredById: z.string().nullable(),
});

export const UpdateMemberProfileSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .min(10)
      .max(20)
      .transform(normalizePhone)
      .refine((val: string) => /^\+[1-9]\d{1,14}$/.test(val), { message: "Invalid phone number format" })
      .optional(),
    address: AddressSchema.optional(),
    showOnMonument: z.boolean().optional(),
    showOnLeaderboard: z.boolean().optional(),
    whatsappOptIn: z.boolean().optional(),
    whatsappOptInDismissedAt: z.coerce.date().optional(),
  })
  .passthrough(); // passthrough to detect if they send cpf/email and return 403

export const SubscriptionStatusSchema = z.enum(["ACTIVE", "PENDING", "SUSPENDED", "CANCELLED"]);

export const MeResponseSchema = MemberResponseSchema.extend({
  subscriptionStatus: SubscriptionStatusSchema.nullable(),
  activePlanId: z.string().nullable(),
  adimplenciaStreakMonths: z.number().int().nonnegative(),
  daysSincePeriodEnd: z.number().int().nullable(),
  isFounder: z.boolean(),
});

export const ListMembersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(10000).default(20),
  search: z.string().optional(),
  status: z.enum(["ALL", "ACTIVE", "PENDING", "SUSPENDED", "CANCELLED"]).default("ALL"),
  role: z.string().optional(),
});

export const AdminMemberListItemSchema = MemberResponseSchema.extend({
  subscriptionStatus: SubscriptionStatusSchema.nullable(),
  activePlanId: z.string().nullable(),
  activePlanName: z.string().nullable().optional(),
  adimplenciaStreakMonths: z.number().int().nonnegative(),
  adminNotes: z.string().nullable().optional(),
});

export const UpdateAdminNoteSchema = z.object({
  adminNotes: z.string().nullable(),
});

export const AdminMemberDetailResponseSchema = AdminMemberListItemSchema.extend({
  subscriptions: z.array(z.any()), // Can be refined
  payments: z.array(z.any()),
  gamificationEvents: z.array(z.any()),
  membershipCards: z.array(z.any()),
});

export const PaginatedMembersResponseSchema = z.object({
  data: z.array(AdminMemberListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const MemberReferralResponseSchema = z.object({
  code: z.string().nullable(),
  successfulReferrals: z.number().int().nonnegative(),
  pointsEarned: z.number().int().nonnegative(),
});

export const SubscriptionIntervalSchema = z.enum(["MONTHLY", "ANNUAL"]);

export const CreateMembershipPlanSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  interval: SubscriptionIntervalSchema,
  benefits: z.array(z.string()),
  isCorporate: z.boolean().default(false),
  maxCards: z.number().int().positive().nullable().optional(),
  highlightLabel: z.string().nullable().optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").nullable().optional(),
  marketingDescription: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateMembershipPlanSchema = CreateMembershipPlanSchema.partial();
export type CreateMembershipPlanInput = z.infer<typeof CreateMembershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof UpdateMembershipPlanSchema>;

export const MembershipPlanResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  price: z.union([z.number(), z.string(), z.any()]),
  interval: SubscriptionIntervalSchema,
  benefits: z.array(z.string()),
  isCorporate: z.boolean(),
  maxCards: z.number().int().nullable(),
  highlightLabel: z.string().nullable(),
  accentColor: z.string().nullable(),
  marketingDescription: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  subscriberCount: z.number().int().nonnegative().optional(),
  isMostPopular: z.boolean().optional(),
});

export const CreateSubscriptionSchema = z.object({
  memberId: z.string().uuid(),
  planId: z.string().uuid(),
  paymentMethod: z.enum(["pix", "card"]).optional(),
  token: z.string().optional(),
  issuer_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  installments: z.number().int().optional(),
});

export const UpdateSubscriptionPlanSchema = z.object({
  planId: z.string().uuid(),
});

export const SubscriptionResponseSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  planId: z.string(),
  status: SubscriptionStatusSchema,
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  gatewaySubscriptionId: z.string().nullable(),
  cancelledAt: z.date().nullable(),
  createdAt: z.date(),
});

export const PaymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const PaymentMethodSchema = z.enum(["CREDIT_CARD", "PIX"]);

export const PaymentResponseSchema = z.object({
  id: z.string(),
  subscriptionId: z.string().nullable(),
  orderId: z.string().nullable(),
  gatewayPaymentId: z.string().nullable(),
  amount: z.union([z.number(), z.string()]),
  status: PaymentStatusSchema,
  method: PaymentMethodSchema,
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});

export const PaginatedPaymentsResponseSchema = z.object({
  data: z.array(PaymentResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const MembershipCardResponseSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  subscriptionId: z.string(),
  qrToken: z.string(),
  validUntil: z.date(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const PollStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);

export const CreatePollSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  options: z.any(),
  opensAt: z.coerce.date(),
  closesAt: z.coerce.date(),
  quorumMinimum: z.number().int().min(1),
  requiresSeniority: z.boolean().default(false),
});

export const PollResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  options: z.any(),
  opensAt: z.date(),
  closesAt: z.date(),
  quorumMinimum: z.number().int(),
  requiresSeniority: z.boolean(),
  status: PollStatusSchema,
  createdAt: z.date(),
});

export const PollWithCountsResponseSchema = PollResponseSchema.extend({
  voteCounts: z.record(z.string(), z.number().int()),
});

export const PollResultResponseSchema = PollWithCountsResponseSchema.extend({
  quorumReached: z.boolean(),
});

export const CastVoteSchema = z.object({
  pollId: z.string().uuid(),
  optionId: z.string(),
});

export const GamificationEventTypeSchema = z.enum([
  "CHECKIN",
  "REFERRAL",
  "ANNIVERSARY",
  "STREAK_6M",
  "STREAK_12M",
  "STREAK_24M",
  "STREAK_36M",
  "STREAK_60M",
]);

export const GamificationEventResponseSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  type: GamificationEventTypeSchema,
  points: z.number().int(),
  metadata: z.any().nullable(),
  createdAt: z.date(),
});

export const MonumentMemberSchema = z.object({
  firstName: z.string(),
  lastInitial: z.string().length(1).or(z.string().length(0)),
  tier: z.string(),
  joinedAt: z.string().datetime(), // ISO string
});

export const MonumentResponseSchema = z.array(MonumentMemberSchema);
export type MonumentMember = z.infer<typeof MonumentMemberSchema>;
