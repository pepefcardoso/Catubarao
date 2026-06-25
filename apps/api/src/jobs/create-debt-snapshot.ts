import { Job } from "bullmq";
import { prisma } from "@repo/db";
import { createDebtSnapshot } from "../modules/transparency/transparency.service";
import type { FastifyBaseLogger } from "fastify";

import type { Queue } from "bullmq";

export async function createDebtSnapshotJob(
  job: Job,
  logger?: FastifyBaseLogger,
  scheduledQueue?: Queue,
) {
  const snapshot = await createDebtSnapshot(prisma);
  if (scheduledQueue) {
    await scheduledQueue.add("debt-milestone-check", { snapshotId: snapshot.id });
  }
  
  const message = `[Debt Snapshot Job] Created snapshot ${snapshot.id}. Total remaining: ${snapshot.totalRemaining}`;
  if (logger) {
    logger.info(message);
  } else {
    console.log(message);
  }
}
