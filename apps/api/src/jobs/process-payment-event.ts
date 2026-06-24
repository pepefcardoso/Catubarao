import type { Job } from "bullmq";
import { prisma } from "@repo/db";
import { mp } from "../lib/mercadopago";
import { updateSubscriptionStatus } from "../modules/members/subscriptions.service";
import { recordGamificationEvent } from "../modules/members/gamification.service";
import Redis from "ioredis";

export async function processPaymentEventJob(job: Job) {
  const { type, data } = job.data;
  const paymentId = String(data.id);

  if (type !== "payment.created" && type !== "payment.updated") {
    // Only process payment updates
  }

  // Fetch payment from MP
  let mpPayment;
  try {
    mpPayment = await mp.payment.get({ id: paymentId } as any);
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

  const mappedMethod = mpPayment.payment_type_id === "ticket" || mpPayment.payment_type_id === "bank_transfer" ? "PIX" : "CREDIT_CARD";

  const existingPayment = await prisma.payment.findUnique({
    where: { gatewayPaymentId: paymentId }
  });

  if (existingPayment && existingPayment.status === mappedStatus) {
    return;
  }

  let subscriptionId: string | undefined;
  let subStatusBeforeUpdate: string | undefined;
  let orderId: string | undefined;

  if (mpPayment.external_reference) {
    const order = await prisma.order.findUnique({
      where: { id: mpPayment.external_reference },
      include: { 
        items: {
          include: { product: true, variant: true }
        },
        customer: true
      }
    });
    if (order) {
      orderId = order.id;

      if (mappedStatus === "PAID" && order.status !== "PAGO") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAGO" }
        });

        const { Queue } = await import("bullmq");
        const { env } = await import("../lib/env.js");
        const emailQueue = new Queue("email", { 
          connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) } 
        });

        const { decrementStock } = await import("../modules/store/stock.service.js");
        for (const item of order.items) {
           try {
              await decrementStock(item.productId, item.variantId, item.quantity, prisma, { email: emailQueue });
           } catch (err) {
              console.error("Failed to decrement stock for item", item.id, err);
           }
        }

        // Notify Admin
        await emailQueue.add("send-email", {
           to: (process.env.ADMIN_EMAIL as string) || "admin@catubarao.com.br",
           template: "NewOrderEmail",
           subject: "Novo Pedido - Clube Atlético Tubarão",
           props: {
             orderId: order.id,
             customerName: order.customer?.name || "Visitante",
             customerEmail: order.guestEmail || order.customer?.email,
             shippingAddress: order.shippingAddress,
             total: order.total,
             items: order.items.map(i => ({
               name: i.product.name,
               variant: i.variant?.sku,
               quantity: i.quantity,
               unitPrice: i.unitPrice
             }))
           }
        });

        // Notify Customer
        const customerEmail = order.guestEmail || order.customer?.email;
        if (customerEmail) {
           await emailQueue.add("send-email", {
              to: customerEmail,
              template: "OrderConfirmationEmail",
              subject: "Pedido Confirmado - Clube Atlético Tubarão",
              props: { orderId: order.id }
           });
        }

        await emailQueue.close();
      } else if ((mappedStatus === "FAILED" || mappedStatus === "REFUNDED") && order.status !== "CANCELADO") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELADO" }
        });
      }
    }
  }

  const preapprovalId = mpPayment.metadata?.subscription_id || (!orderId ? mpPayment.external_reference : null);

  if (!orderId && preapprovalId) {
    const sub = await prisma.subscription.findFirst({
      where: { gatewaySubscriptionId: preapprovalId }
    });
    if (sub) {
      subscriptionId = sub.id;
      subStatusBeforeUpdate = sub.status;

      if (mappedStatus === "PAID") {
        await updateSubscriptionStatus(sub.id, "ACTIVE", prisma);
      } else if (mappedStatus === "FAILED" || mappedStatus === "REFUNDED") {
        await updateSubscriptionStatus(sub.id, "PENDING", prisma);
      }
    }
  }

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
      const { env } = await import("../lib/env.js");
      const emailQueue = new Queue("email", { 
        connection: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) } 
      });

      if (!previousPaid) {
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

      const redis = new Redis({
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT)
      });
      await redis.del("stats:members");
      await redis.quit();
    }
  }

  await prisma.payment.upsert({
    where: { gatewayPaymentId: paymentId },
    create: {
      gatewayPaymentId: paymentId,
      amount,
      status: mappedStatus,
      method: mappedMethod,
      subscriptionId,
      orderId,
      paidAt: mappedStatus === "PAID" ? new Date() : null,
    },
    update: {
      status: mappedStatus,
      paidAt: mappedStatus === "PAID" ? new Date() : null,
    }
  });
}
