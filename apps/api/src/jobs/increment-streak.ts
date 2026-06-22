import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { recordGamificationEvent } from "../modules/members/gamification.service";

export async function incrementStreakJob(job: Job) {
  const batchSize = 100;
  let cursor: string | undefined;
  let processedCount = 0;

  while (true) {
    const members = await prisma.member.findMany({
      where: {
        subscriptions: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        adimplenciaStreakMonths: true,
      },
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
    });

    if (members.length === 0) {
      break;
    }

    for (const member of members) {
      const newStreak = member.adimplenciaStreakMonths + 1;

      await prisma.member.update({
        where: { id: member.id },
        data: { adimplenciaStreakMonths: newStreak },
      });

      try {
        if (newStreak === 6) {
          await recordGamificationEvent(
            member.id,
            "STREAK_6M",
            prisma,
            null,
            `STREAK_6M_${member.id}`
          );
        } else if (newStreak === 12) {
          await recordGamificationEvent(
            member.id,
            "STREAK_12M",
            prisma,
            null,
            `STREAK_12M_${member.id}`
          );
        }
      } catch (err: any) {
        // Ignore errors for missing rules or duplicates
        if (err.name !== "NotFoundError" && err.name !== "ConflictError") {
          console.error(`Failed to record streak gamification event for member ${member.id}:`, err);
        }
      }
    }

    processedCount += members.length;
    cursor = members[members.length - 1].id;
  }

  return { processedCount };
}
