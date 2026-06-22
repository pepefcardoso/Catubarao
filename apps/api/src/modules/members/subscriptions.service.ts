import type { PrismaClient } from "@repo/db";
import { ConflictError, NotFoundError, ValidationError } from "../../lib/errors";
import { mp } from "../../lib/mercadopago";
import { env } from "../../lib/env";
import crypto from "crypto";

export async function createSubscription(memberId: string, planId: string, db: PrismaClient) {
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
  let mpRes;
  try {
    mpRes = await mp.preApproval.create({
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
    });
  } catch (err) {
    console.error("MP CREATE ERROR:", err);
    throw err;
  }

  const gatewaySubscriptionId = mpRes.id;
  const checkoutUrl = mpRes.init_point;

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

      if (plan.isCorporate && plan.maxCards) {
        const cardsData = [];
        for (let i = 0; i < plan.maxCards; i++) {
          cardsData.push({
            memberId,
            subscriptionId: sub.id,
            qrToken: crypto.randomUUID(),
            validUntil: currentPeriodEnd,
            isActive: false,
          });
        }
        await tx.membershipCard.createMany({ data: cardsData });
      }

      return sub;
    });
  } catch (err) {
    console.error("PRISMA CREATE ERROR:", err);
    throw err;
  }

  return { subscriptionId: subscription.id, checkoutUrl };
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

    if (subscription.plan.isCorporate) {
      await tx.membershipCard.updateMany({
        where: { subscriptionId },
        data: { isActive: false },
      });
    }
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
    include: { plan: true },
  });
  if (!subscription) throw new NotFoundError("Subscription not found");

  await db.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscriptionId },
      data: { status },
    });

    if (subscription.plan.isCorporate) {
      // If status is not active, deactivate all cards. If active, reactivate them.
      await tx.membershipCard.updateMany({
        where: { subscriptionId },
        data: { isActive: status === "ACTIVE" },
      });
    }
  });

  return { success: true };
}
