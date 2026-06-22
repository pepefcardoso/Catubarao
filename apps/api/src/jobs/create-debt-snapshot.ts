import { Job } from "bullmq";
import { prisma } from "@repo/db";
import { createDebtSnapshot } from "../modules/transparency/transparency.service";
import type { FastifyBaseLogger } from "fastify";

export async function createDebtSnapshotJob(job: Job, logger?: FastifyBaseLogger) {
  const snapshot = await createDebtSnapshot(prisma);
  
  const message = `[Debt Snapshot Job] Created snapshot ${snapshot.id}. Total remaining: ${snapshot.totalRemaining}`;
  if (logger) {
    logger.info(message);
  } else {
    console.log(message);
  }
}
