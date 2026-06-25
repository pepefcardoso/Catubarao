import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { recordGamificationEvent } from "../modules/members/gamification.service";
import { Queue } from "bullmq";
import { env } from "../lib/env";

export async function anniversaryCheckJob(_job: Job) {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();
  const todayYear = now.getFullYear();

  // Find all members with at least one ACTIVE subscription
  // and oldest ACTIVE subscription's createdAt anniversary is today
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      createdAt: { not: undefined },
    },
    select: {
      memberId: true,
      createdAt: true,
      member: { select: { email: true, name: true } },
    },
    distinct: ["memberId"],
    orderBy: { createdAt: "asc" }, // oldest subscription per member
  });

  const todayAnniversaries = subscriptions.filter((s) => {
    const d = new Date(
      s.createdAt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    return d.getMonth() + 1 === todayMonth && d.getDate() === todayDay;
  });

  const emailQueue = new Queue("email", {
    connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) },
  });

  for (const sub of todayAnniversaries) {
    const yearsSince = todayYear - new Date(sub.createdAt).getFullYear();
    if (yearsSince <= 0) continue; // It's their first day, not an anniversary

    const idempotencyKey = `ANNIVERSARY_${sub.memberId}_${todayYear}`;

    try {
      await recordGamificationEvent(
        sub.memberId,
        "ANNIVERSARY",
        prisma,
        { year: todayYear, yearsSince },
        idempotencyKey
      );
    } catch (err: any) {
      if (err.name !== "NotFoundError" && err.name !== "ConflictError") {
        console.error(`Anniversary event failed for ${sub.memberId}:`, err);
      }
      continue;
    }

    await emailQueue.add("send-email", {
      template: "AnniversaryEmail",
      to: sub.member.email,
      subject: `Feliz aniversário de ${yearsSince} ano${yearsSince > 1 ? "s" : ""} como Sócio Tubarão!`,
      props: { name: sub.member.name, yearsSince },
    });
  }

  await emailQueue.close();
  return { processed: todayAnniversaries.length };
}
