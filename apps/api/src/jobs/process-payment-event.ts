import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { mp } from "../lib/mercadopago";
import { updateSubscriptionStatus } from "../modules/members/subscriptions.service";

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

  let subscriptionId: string | undefined;

  // If there's a preapproval, find the subscription
  if (preapprovalId) {
    const sub = await prisma.subscription.findFirst({
      where: { gatewaySubscriptionId: preapprovalId }
    });
    if (sub) {
      subscriptionId = sub.id;

      // Update subscription status if necessary
      if (mappedStatus === "PAID") {
        await updateSubscriptionStatus(sub.id, "ACTIVE", prisma);
      } else if (mappedStatus === "FAILED" || mappedStatus === "REFUNDED") {
        await updateSubscriptionStatus(sub.id, "PENDING", prisma);
      }
    }
  }

  // Enqueue WelcomeEmail if this is a PAID event and there's a subscription, 
  // and no previous PAID payment exists for this member.
  if (mappedStatus === "PAID" && subscriptionId) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { member: true }
    });
    
    if (sub && sub.member) {
      const previousPaid = await prisma.payment.findFirst({
        where: { 
          subscription: { memberId: sub.memberId }, 
          status: "PAID" 
        }
      });

      if (!previousPaid) {
        // It's the first paid payment for this member! Enqueue welcome email.
        const { Queue } = await import("bullmq");
        const { env } = await import("../lib/env");
        const emailQueue = new Queue("email", { 
          connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) } 
        });
        
        await emailQueue.add("send-welcome", { 
          to: sub.member.email, 
          subject: "Bem-vindo ao Sócio-Torcedor Tubarão!",
          template: "WelcomeEmail",
          props: { name: sub.member.name }
        });
        await emailQueue.close();
      }
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
