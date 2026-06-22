import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { mp } from "../lib/mercadopago";
import { updateSubscriptionStatus } from "../modules/members/subscriptions.service";
import { recordGamificationEvent } from "../modules/members/gamification.service";

export async function processPaymentEventJob(job: Job) {
  const { type, data } = job.data;
  const paymentId = String(data.id);

  if (type !== "payment.created" && type !== "payment.updated") {
    // Only process payment updates, but Mercado Pago sends "payment" topic actions.
    // The spec specifically handles payment.approved, payment.rejected, etc. but those are statuses.
    // The webhook type from MP is typically 'payment' or 'plan', and action is 'payment.created' or 'payment.updated'.
  }

  // Fetch payment from MP
  let mpPayment;
  try {
    mpPayment = await mp.payment.findById(Number(paymentId));
  } catch (err) {
    console.error("Failed to fetch MP payment", err);
    throw err; // retry
  }

  // Determine status
  const mpStatus = mpPayment.status;
  const amount = mpPayment.transaction_amount || 0;
  
  let mappedStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" = "PENDING";
  if (mpStatus === "approved") mappedStatus = "PAID";
  else if (mpStatus === "rejected" || mpStatus === "cancelled") mappedStatus = "FAILED";
  else if (mpStatus === "refunded") mappedStatus = "REFUNDED";

  const mappedMethod = mpPayment.payment_type_id === "ticket" || mpPayment.payment_type_id === "bank_transfer" ? "PIX" : "CREDIT_CARD"; // Assuming PIX falls under bank_transfer/ticket in MP logic for BR

  const preapprovalId = mpPayment.metadata?.subscription_id || mpPayment.external_reference || null;

  const existingPayment = await prisma.payment.findUnique({
    where: { gatewayPaymentId: paymentId }
  });

  if (existingPayment && existingPayment.status === mappedStatus) {
    // Already processed this exact status for this payment, return early to avoid duplicate emails/events
    return;
  }

  let subscriptionId: string | undefined;

  let subStatusBeforeUpdate: string | undefined;

  // If there's a preapproval, find the subscription
  if (preapprovalId) {
    const sub = await prisma.subscription.findFirst({
      where: { gatewaySubscriptionId: preapprovalId }
    });
    if (sub) {
      subscriptionId = sub.id;
      subStatusBeforeUpdate = sub.status;

      // Update subscription status if necessary
      if (mappedStatus === "PAID") {
        await updateSubscriptionStatus(sub.id, "ACTIVE", prisma);
      } else if (mappedStatus === "FAILED" || mappedStatus === "REFUNDED") {
        await updateSubscriptionStatus(sub.id, "PENDING", prisma);
      }
    }
  }

  // Enqueue emails if this is a PAID event and there's a subscription
  if (mappedStatus === "PAID" && subscriptionId) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { member: true, plan: true }
    });
    
    if (sub && sub.member) {
      const previousPaid = await prisma.payment.findFirst({
        where: { 
          subscription: { memberId: sub.memberId }, 
          status: "PAID" 
        }
      });

      const { Queue } = await import("bullmq");
      const { env } = await import("../lib/env");
      const emailQueue = new Queue("email", { 
        connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) } 
      });

      if (!previousPaid) {
        // It's the first paid payment for this member! Enqueue welcome email.
        await emailQueue.add("send-welcome", { 
          to: sub.member.email, 
          subject: "Bem-vindo ao Sócio-Torcedor Tubarão!",
          template: "WelcomeEmail",
          props: { 
            name: sub.member.name,
            planName: sub.plan.name,
            cardDownloadLink: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/member/card`
          }
        });

        // Award referral points if referred by someone
        if (sub.member.referredById) {
          try {
            await recordGamificationEvent(
              sub.member.referredById,
              "REFERRAL",
              prisma,
              { referredMemberId: sub.memberId },
              `referral_${sub.memberId}`
            );
          } catch (err) {
            console.error("Failed to record gamification event for referral:", err);
          }
        }
      } else {
        if (subStatusBeforeUpdate === "SUSPENDED") {
          await emailQueue.add("send-reactivation", { 
            to: sub.member.email, 
            subject: "Sua assinatura foi reativada - Clube Atlético Tubarão",
            template: "ReactivationEmail",
            props: { name: sub.member.name, planName: sub.plan.name }
          });
        } else {
          await emailQueue.add("send-payment-confirmed", { 
            to: sub.member.email, 
            subject: "Pagamento Confirmado - Clube Atlético Tubarão",
            template: "PaymentConfirmedEmail",
            props: { name: sub.member.name, planName: sub.plan.name }
          });
        }
      }
      
      await emailQueue.close();
    }
  }

  // Upsert Payment record using gatewayPaymentId
  await prisma.payment.upsert({
    where: { gatewayPaymentId: paymentId },
    create: {
      gatewayPaymentId: paymentId,
      amount,
      status: mappedStatus,
      method: mappedMethod,
      subscriptionId,
      paidAt: mappedStatus === "PAID" ? new Date() : null,
    },
    update: {
      status: mappedStatus,
      paidAt: mappedStatus === "PAID" ? new Date() : null,
    }
  });
}
