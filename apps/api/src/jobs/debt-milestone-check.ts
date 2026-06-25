import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { checkAndCreateMilestoneBanner } from "../modules/transparency/transparency.service";
import type { FastifyBaseLogger } from "fastify";

export async function debtMilestoneCheckJob(job: Job, logger?: FastifyBaseLogger) {
  const { snapshotId } = job.data as { snapshotId: string };

  const snapshot = await prisma.debtSnapshot.findUniqueOrThrow({ where: { id: snapshotId } });
  await checkAndCreateMilestoneBanner(snapshot, prisma);

  const msg = `[Debt Milestone Check] Processed snapshot ${snapshotId}`;
  logger ? logger.info(msg) : console.log(msg);
}
