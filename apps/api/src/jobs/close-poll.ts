import type { Job } from "bullmq";
import { closePoll } from "../modules/members/polls.service";
import { prisma } from "@repo/db";

export async function closePollJob(job: Job) {
  const { pollId } = job.data;
  if (!pollId) return;

  await closePoll(pollId, prisma);
}
