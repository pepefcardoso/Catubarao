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
  },
  plugins: [
    admin(),
    jwt(),
  ],
});
