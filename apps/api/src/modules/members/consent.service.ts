import type { PrismaClient } from "@repo/db";
import type { CreateConsentInput } from "@repo/schemas/consent";

export async function saveConsentLog(
  memberId: string,
  input: CreateConsentInput,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  db: PrismaClient
) {
  return db.consentLog.create({
    data: {
      memberId,
      ipAddress,
      userAgent,
      choices: input.choices as any,
    },
  });
}
