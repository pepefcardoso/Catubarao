import type { PrismaClient, GamificationEventType } from "@repo/db";
import { recordGamificationEvent } from "../modules/members/gamification.service";
import { env } from "../lib/env";
import { Queue } from "bullmq";

const MILESTONE_TYPES: Record<number, GamificationEventType> = {
  6:  "STREAK_6M",
  12: "STREAK_12M",
  24: "STREAK_24M",
  36: "STREAK_36M",
  60: "STREAK_60M",
};

const MILESTONE_TEMPLATES: Record<number, { template: string; subject: string }> = {
  6:  { template: "StreakMilestoneEmail", subject: "6 meses de fidelidade — obrigado, Tubarão!" },
  12: { template: "StreakMilestoneEmail", subject: "1 ano de fidelidade — você é um ídolo!" },
  24: { template: "StreakMilestoneEmail", subject: "2 anos de fidelidade — lenda do Tubarão!" },
  36: { template: "StreakMilestoneEmail", subject: "3 anos de fidelidade — você é imortal!" },
  60: { template: "StreakMilestoneEmail", subject: "5 anos de fidelidade — monumento vivo!" },
};

export async function checkStreakMilestone(
  memberId: string,
  memberEmail: string,
  memberName: string,
  newStreak: number,
  db: PrismaClient
): Promise<void> {
  const type = MILESTONE_TYPES[newStreak];
  if (!type) return;

  try {
    await recordGamificationEvent(
      memberId,
      type,
      db,
      { streakMonths: newStreak },
      `${type}_${memberId}`
    );
  } catch (err: any) {
    if (err.name !== "NotFoundError" && err.name !== "ConflictError") {
      throw err;
    }
    return; // rule inactive or already recorded — skip email too
  }

  const emailMeta = MILESTONE_TEMPLATES[newStreak];
  const emailQueue = new Queue("email", {
    connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) }
  });
  
  await emailQueue.add("send-email", {
    template: emailMeta.template,
    to: memberEmail,
    subject: emailMeta.subject,
    props: { name: memberName, streakMonths: newStreak },
  });
  
  await emailQueue.close();
}
