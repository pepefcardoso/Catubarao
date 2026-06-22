import type { PrismaClient } from "@repo/db";
import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from "../../lib/errors";
import { isEligibleToVote } from "./members.service";

export async function createPoll(data: any, db: PrismaClient, queue: any) {
  const poll = await db.poll.create({
    data: {
      ...data,
      status: "OPEN",
    }
  });

  const delay = new Date(poll.closesAt).getTime() - Date.now();
  if (delay > 0) {
    await queue.add("close-poll", { pollId: poll.id }, { delay });
  } else {
    await queue.add("close-poll", { pollId: poll.id });
  }

  return poll;
}

export async function listOpenPolls(db: PrismaClient) {
  return db.poll.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPollWithCounts(pollId: string, db: PrismaClient) {
  const poll = await db.poll.findUnique({
    where: { id: pollId },
  });

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  const votes = await db.pollVote.groupBy({
    by: ["optionId"],
    where: { pollId },
    _count: { optionId: true },
  });

  const voteCounts: Record<string, number> = {};
  for (const v of votes) {
    voteCounts[v.optionId] = v._count.optionId;
  }

  return {
    ...poll,
    voteCounts,
  };
}

export async function castVote(pollId: string, memberId: string, optionId: string, db: PrismaClient) {
  const poll = await db.poll.findUnique({
    where: { id: pollId },
  });

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  if (poll.status !== "OPEN") {
    throw new ValidationError("Poll is not open for voting");
  }
  
  if (poll.requiresSeniority) {
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { adimplenciaStreakMonths: true },
    });
    if (!member || !isEligibleToVote(member)) {
      throw new ForbiddenError("Not eligible to vote in this poll");
    }
  }

  try {
    await db.pollVote.create({
      data: {
        pollId,
        memberId,
        optionId,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new ConflictError("Member has already voted in this poll");
    }
    throw err;
  }
}

export async function closePoll(pollId: string, db: PrismaClient) {
  const poll = await db.poll.update({
    where: { id: pollId },
    data: { status: "CLOSED" },
  });
  return poll;
}

export async function getPollResult(pollId: string, db: PrismaClient) {
  const pollWithCounts = await getPollWithCounts(pollId, db);

  if (pollWithCounts.status !== "CLOSED") {
    throw new ValidationError("Poll results are not available yet");
  }

  const totalVotes = Object.values(pollWithCounts.voteCounts).reduce((sum, count) => sum + count, 0);
  const quorumReached = totalVotes >= pollWithCounts.quorumMinimum;

  return {
    ...pollWithCounts,
    quorumReached,
  };
}
