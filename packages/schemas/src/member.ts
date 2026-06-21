import { z } from "zod";

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
    .refine((val) => /^\+[1-9]\d{1,14}$/.test(val), { message: "Invalid phone number format" }),
  birthDate: z.coerce.date(),
  referralCode: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  whatsappOptIn: z.boolean().default(false),
  address: z.any().optional(),
  showOnMonument: z.boolean().default(false),
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
  showOnMonument: z.boolean(),
  address: z.any().nullable(),
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
      .refine((val) => /^\+[1-9]\d{1,14}$/.test(val), { message: "Invalid phone number format" })
      .optional(),
    address: z.any().optional(),
    showOnMonument: z.boolean().optional(),
  })
  .passthrough(); // passthrough to detect if they send cpf/email and return 403

export const SubscriptionStatusSchema = z.enum(["ACTIVE", "PENDING", "SUSPENDED", "CANCELLED"]);

export const MeResponseSchema = MemberResponseSchema.extend({
  subscriptionStatus: SubscriptionStatusSchema.nullable(),
  adimplenciaStreak: z.number().int().nonnegative(),
});

export const SubscriptionIntervalSchema = z.enum(["MONTHLY", "ANNUAL"]);

export const CreateMembershipPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  interval: SubscriptionIntervalSchema,
  benefits: z.array(z.string()),
  isCorporate: z.boolean().default(false),
  maxCards: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateMembershipPlanSchema = CreateMembershipPlanSchema.partial();
export type CreateMembershipPlanInput = z.infer<typeof CreateMembershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof UpdateMembershipPlanSchema>;

export const MembershipPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.union([z.number(), z.string(), z.any()]),
  interval: SubscriptionIntervalSchema,
  benefits: z.array(z.string()),
  isCorporate: z.boolean(),
  maxCards: z.number().int().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const CreateSubscriptionSchema = z.object({
  memberId: z.string().uuid(),
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
]);

export const GamificationEventResponseSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  type: GamificationEventTypeSchema,
  points: z.number().int(),
  metadata: z.any().nullable(),
  createdAt: z.date(),
});
