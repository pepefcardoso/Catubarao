import { Job, Queue } from "bullmq";
import { prisma } from "@repo/db";
import { env } from "../lib/env";
import { isEligibleToVote } from "../modules/members/members.service";

export async function sendPollOpenEmailsJob(job: Job) {
  const { pollId } = job.data;

  const poll = await prisma.poll.findUnique({
    where: { id: pollId }
  });

  if (!poll) return;

  // Find all active members
  const activeMembers = await prisma.member.findMany({
    where: {
      subscriptions: {
        some: { status: "ACTIVE" }
      }
    }
  });

  const emailQueue = new Queue("email", { 
    connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) } 
  });

  for (const member of activeMembers) {
    if (poll.requiresSeniority) {
      if (!isEligibleToVote(member)) {
        continue; // Skip ineligible voters
      }
    }

    await emailQueue.add(`send-poll-open-${member.id}`, {
      to: member.email,
      subject: `Nova votação: ${poll.title} - Clube Atlético Tubarão`,
      template: "PollOpenEmail",
      props: {
        name: member.name,
        pollTitle: poll.title,
        pollLink: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/member/transparency/polls/${poll.id}`
      }
    });
  }

  await emailQueue.close();
}
