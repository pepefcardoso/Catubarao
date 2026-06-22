import { Job, Queue } from "bullmq";
import { prisma } from "@repo/db";
import { suspendSubscription } from "../modules/members/subscriptions.service";
import { env } from "../lib/env";

export async function processDelinquencyJob(job: Job) {
  const pendingSubscriptions = await prisma.subscription.findMany({
    where: { status: "PENDING" },
    include: { member: true }
  });

  if (pendingSubscriptions.length === 0) return;

  const now = new Date();
  
  const emailQueue = new Queue("email", { 
    connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) } 
  });

  for (const sub of pendingSubscriptions) {
    // Calculate days since currentPeriodEnd
    // If currentPeriodEnd is in the future, it's not delinquent yet
    const diffTime = now.getTime() - new Date(sub.currentPeriodEnd).getTime();
    if (diffTime <= 0) continue;
    
    const daysDelinquent = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let typeToSend: string | null = null;
    let templateName: string | null = null;
    let subject: string | null = null;
    let shouldSuspend = false;

    if (daysDelinquent >= 30) {
      typeToSend = "SUSPENSION";
      templateName = "SuspensionEmail";
      subject = "Assinatura Suspensa - Clube Atlético Tubarão";
      shouldSuspend = true;
    } else if (daysDelinquent >= 15) {
      typeToSend = "DELINQUENCY_D15";
      templateName = "DelinquencyD15Email";
      subject = "Último Aviso: Pagamento pendente - Clube Atlético Tubarão";
    } else if (daysDelinquent >= 7) {
      typeToSend = "DELINQUENCY_D7";
      templateName = "DelinquencyD7Email";
      subject = "Segundo Aviso: Pagamento pendente - Clube Atlético Tubarão";
    } else if (daysDelinquent >= 1) {
      typeToSend = "DELINQUENCY_D1";
      templateName = "DelinquencyD1Email";
      subject = "Aviso: Pagamento pendente - Clube Atlético Tubarão";
    }

    if (typeToSend && templateName && subject) {
      // Check if this type was already sent
      const existingNotification = await prisma.subscriptionNotification.findUnique({
        where: {
          subscriptionId_type: {
            subscriptionId: sub.id,
            type: typeToSend
          }
        }
      });

      if (!existingNotification) {
        if (shouldSuspend) {
          await suspendSubscription(sub.id, prisma);
        }

        await emailQueue.add(`send-delinquency-${typeToSend}`, {
          to: sub.member.email,
          subject,
          template: templateName,
          props: { name: sub.member.name }
        });

        await prisma.subscriptionNotification.create({
          data: {
            subscriptionId: sub.id,
            type: typeToSend
          }
        });
      }
    }
  }

  await emailQueue.close();
}
