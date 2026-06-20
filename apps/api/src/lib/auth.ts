import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, jwt } from "better-auth/plugins";
import { prisma } from "@repo/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "Member",
    additionalFields: {
      cpf: { type: "string" },
      phone: { type: "string" },
      birthDate: { type: "date" },
      referralCode: { type: "string", required: false },
      isActive: { type: "boolean" },
      marketingConsent: { type: "boolean", required: false },
      whatsappOptIn: { type: "boolean", required: false },
    },
  },
  plugins: [
    admin(),
    jwt(),
  ],
});

