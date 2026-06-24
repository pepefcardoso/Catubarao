import type { PrismaClient } from "@repo/db";
import type { CreateWaitlistEntryInput, WaitlistEntry } from "@repo/schemas/waitlist";

export async function addWaitlistEntry(
  input: CreateWaitlistEntryInput,
  db: PrismaClient
): Promise<WaitlistEntry> {
  const existing = await db.waitlist.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    return {
      ...existing,
      createdAt: existing.createdAt.toISOString(),
    };
  }

  const newEntry = await db.waitlist.create({
    data: {
      email: input.email,
      source: input.source,
    },
  });

  return {
    ...newEntry,
    createdAt: newEntry.createdAt.toISOString(),
  };
}

export async function getWaitlist(db: PrismaClient): Promise<WaitlistEntry[]> {
  const entries = await db.waitlist.findMany({
    orderBy: { createdAt: "desc" },
  });

  return entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));
}
