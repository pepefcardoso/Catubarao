import type { PrismaClient } from "@repo/db";
import { ConflictError, NotFoundError, ValidationError } from "../../lib/errors";
import { mp } from "../../lib/mercadopago";
import { env } from "../../lib/env";
import crypto from "crypto";

import type { CreateSubscriptionSchema } from "@repo/schemas/member";
import type { z } from "zod";

type CreateSubData = Omit<z.infer<typeof CreateSubscriptionSchema>, "memberId">;

export async function createSubscription(memberId: string, data: CreateSubData, db: PrismaClient) {
  const { planId, paymentMethod, token, issuer_id, payment_method_id, installments } = data;

  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member) throw new NotFoundError("Member not found");

  const plan = await db.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new NotFoundError("Plan not found");
  if (!plan.isActive) throw new ValidationError("Plan is not active");

  const existingActive = await db.subscription.findFirst({
    where: {
      memberId,
      status: "ACTIVE",
    },
  });
  if (existingActive) throw new ConflictError("Member already has an active subscription");

  const reason = `Assinatura - ${plan.name}`;
  let gatewaySubscriptionId = "";
  let checkoutUrl: string | undefined = undefined;
  let pixQrCode: string | undefined = undefined;
  let pixQrCodeBase64: string | undefined = undefined;

  try {
    if (paymentMethod === "pix") {
      const mpRes = await mp.payment.create({
        transaction_amount: Number(plan.price),
        description: reason,
        payment_method_id: "pix",
        payer: {
          email: member.email,
          first_name: member.name,
          identification: {
            type: "CPF",
            number: member.cpf || "",
          },
        },
      });
      gatewaySubscriptionId = mpRes.id!.toString();
      pixQrCode = mpRes.point_of_interaction?.transaction_data?.qr_code;
      pixQrCodeBase64 = mpRes.point_of_interaction?.transaction_data?.qr_code_base64;
    } else {
      const mpRes = await mp.preApproval.create({
        reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: plan.interval === "MONTHLY" ? "months" : "years",
          transaction_amount: Number(plan.price),
          currency_id: "BRL",
        },
        payer_email: member.email,
        back_url: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/member/dashboard`,
        status: "pending",
        card_token_id: token,
      });
      gatewaySubscriptionId = mpRes.id?.toString() || "";
      checkoutUrl = mpRes.init_point;
    }
  } catch (err) {
    console.error("MP CREATE ERROR:", err);
    throw err;
  }

  const now = new Date();
  const currentPeriodEnd = new Date(now);
  if (plan.interval === "MONTHLY") {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  } else {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  }

  let subscription;
  try {
    subscription = await db.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          memberId,
          planId,
          status: "PENDING",
          currentPeriodStart: now,
          currentPeriodEnd,
          gatewaySubscriptionId,
        },
      });

      const cardsData = [];
      // Primary member card
      cardsData.push({
        memberId,
        subscriptionId: sub.id,
        qrToken: crypto.randomUUID(),
        validUntil: currentPeriodEnd,
        isActive: false,
      });

      if (plan.isCorporate && plan.maxCards) {
        const additionalCards = Math.max(0, plan.maxCards - 1);
        for (let i = 0; i < additionalCards; i++) {
          cardsData.push({
            memberId,
            subscriptionId: sub.id,
            qrToken: crypto.randomUUID(),
            validUntil: currentPeriodEnd,
            isActive: false,
          });
        }
      }
      
      await tx.membershipCard.createMany({ data: cardsData });

      return sub;
    });
  } catch (err) {
    console.error("PRISMA CREATE ERROR:", err);
    throw err;
  }

  return { subscriptionId: subscription.id, checkoutUrl, pixQrCode, pixQrCodeBase64 };
}

export async function updateSubscriptionPlan(subscriptionId: string, planId: string, db: PrismaClient) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { member: true },
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  const plan = await db.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new NotFoundError("Plan not found");
  if (!plan.isActive) throw new ValidationError("Plan is not active");

  if (subscription.gatewaySubscriptionId) {
    try {
      await mp.preApproval.update(subscription.gatewaySubscriptionId, { status: "cancelled" });
    } catch (err) {
      console.warn("Failed to cancel old MP subscription", err);
    }
  }

  const reason = `Assinatura - ${plan.name}`;
  const mpRes = await mp.preApproval.create({
    reason,
    auto_recurring: {
      frequency: 1,
      frequency_type: plan.interval === "MONTHLY" ? "months" : "years",
      transaction_amount: Number(plan.price),
      currency_id: "BRL",
    },
    payer_email: subscription.member.email,
    back_url: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/member/dashboard`,
    status: "pending",
  });

  const updated = await db.subscription.update({
    where: { id: subscriptionId },
    data: {
      planId,
      gatewaySubscriptionId: mpRes.id,
    },
  });

  return { subscriptionId: updated.id, checkoutUrl: mpRes.init_point };
}

export async function reactivateFromDelinquency(subscriptionId: string, db: PrismaClient) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  await db.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscriptionId },
      data: { status: "ACTIVE" }
    });

    await tx.member.update({
      where: { id: subscription.memberId },
      data: {
        adimplenciaStreakMonths: 0,
        lastAdimplenciaResetAt: new Date()
      }
    });

    await tx.subscriptionNotification.deleteMany({
      where: { subscriptionId }
    });

    await tx.membershipCard.updateMany({
      where: { subscriptionId },
      data: { isActive: false }
    });

    const cardsData = [];
    cardsData.push({
      memberId: subscription.memberId,
      subscriptionId,
      qrToken: crypto.randomUUID(),
      validUntil: subscription.currentPeriodEnd,
      isActive: true,
    });

    if (subscription.plan.isCorporate && subscription.plan.maxCards) {
      const additionalCards = Math.max(0, subscription.plan.maxCards - 1);
      for (let i = 0; i < additionalCards; i++) {
        cardsData.push({
          memberId: subscription.memberId,
          subscriptionId,
          qrToken: crypto.randomUUID(),
          validUntil: subscription.currentPeriodEnd,
          isActive: true,
        });
      }
    }
    
    await tx.membershipCard.createMany({ data: cardsData });
  });

  return { success: true };
}

export async function renewActiveSubscription(subscriptionId: string, db: PrismaClient) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  const now = new Date();
  const newPeriodEnd = new Date(subscription.currentPeriodEnd);
  
  if (subscription.plan.interval === "MONTHLY") {
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
  } else {
    newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
  }

  // Only renew if we've actually passed the end date or are very close to it
  // But for the scope of the function we blindly extend
  await db.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: newPeriodEnd
      }
    });

    await tx.membershipCard.updateMany({
      where: { subscriptionId },
      data: { isActive: false }
    });

    const cardsData = [];
    cardsData.push({
      memberId: subscription.memberId,
      subscriptionId,
      qrToken: crypto.randomUUID(),
      validUntil: newPeriodEnd,
      isActive: true,
    });

    if (subscription.plan.isCorporate && subscription.plan.maxCards) {
      const additionalCards = Math.max(0, subscription.plan.maxCards - 1);
      for (let i = 0; i < additionalCards; i++) {
        cardsData.push({
          memberId: subscription.memberId,
          subscriptionId,
          qrToken: crypto.randomUUID(),
          validUntil: newPeriodEnd,
          isActive: true,
        });
      }
    }
    
    await tx.membershipCard.createMany({ data: cardsData });
  });

  return { success: true };
}

export async function suspendSubscription(subscriptionId: string, db: PrismaClient) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId }
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  await db.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscriptionId },
      data: { status: "SUSPENDED" }
    });

    await tx.member.update({
      where: { id: subscription.memberId },
      data: {
        adimplenciaStreakMonths: 0,
        lastAdimplenciaResetAt: new Date()
      }
    });

    await tx.membershipCard.updateMany({
      where: { subscriptionId },
      data: { isActive: false }
    });
  });

  return { success: true };
}

export async function cancelSubscription(subscriptionId: string, db: PrismaClient) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  if (subscription.gatewaySubscriptionId) {
    try {
      await mp.preApproval.update(subscription.gatewaySubscriptionId, { status: "cancelled" });
    } catch (err) {
      console.warn("Failed to cancel MP subscription", err);
    }
  }

  await db.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    await tx.membershipCard.updateMany({
      where: { subscriptionId },
      data: { isActive: false },
    });
  });

  return { success: true };
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "CANCELLED",
  db: PrismaClient
) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  let result;
  if (status === "ACTIVE") {
    if (subscription.status === "ACTIVE") {
      result = await renewActiveSubscription(subscriptionId, db);
    } else {
      result = await reactivateFromDelinquency(subscriptionId, db);
    }
  } else if (status === "SUSPENDED") {
    result = await suspendSubscription(subscriptionId, db);
  } else if (status === "CANCELLED") {
    result = await cancelSubscription(subscriptionId, db);
  } else if (status === "PENDING") {
    await db.subscription.update({
      where: { id: subscriptionId },
      data: { status: "PENDING" }
    });
    result = { success: true };
  } else {
    result = { success: true };
  }
  
  await invalidateStatsCache();
  return result;
}

async function invalidateStatsCache() {
  try {
    const Redis = (await import("ioredis")).default;
    const redis = new Redis({
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT)
    });
    await redis.del("stats:members");
    await redis.quit();
  } catch (err) {
    console.error("Failed to invalidate stats cache", err);
  }
}

