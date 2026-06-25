import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { recordGamificationEvent } from "../modules/members/gamification.service";
import { checkStreakMilestone } from "./streak-milestone-check";

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
        email: true,
        name: true,
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

      await checkStreakMilestone(member.id, member.email, member.name, newStreak, prisma);
    }

    processedCount += members.length;
    cursor = members[members.length - 1].id;
  }

  return { processedCount };
}
