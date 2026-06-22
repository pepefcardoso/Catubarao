import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@repo/db";
import {
  createSubscription,
  reactivateFromDelinquency,
  renewActiveSubscription,
  suspendSubscription,
  cancelSubscription
} from "./subscriptions.service";
import crypto from "crypto";

vi.mock("../../lib/mercadopago", () => ({
  mp: {
    preApproval: {
      create: vi.fn().mockResolvedValue({
        id: "mp-mock-id",
        init_point: "https://mp.local/checkout"
      }),
      update: vi.fn(),
    },
  },
}));

describe("Subscriptions Service", () => {
  let memberId: string;
  let planId: string;

  beforeAll(async () => {
    // Create member and plan
    const member = await prisma.member.create({
      data: {
        id: crypto.randomUUID(),
        name: "Service Test Member",
        email: `service.test.${Date.now()}@example.com`,
        adimplenciaStreakMonths: 5,
        cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11),
      }
    });
    memberId = member.id;

    const plan = await prisma.membershipPlan.create({
      data: {
        id: crypto.randomUUID(),
        name: "Test Plan",
        price: 50,
        interval: "MONTHLY",
        benefits: [],
      }
    });
    planId = plan.id;
  });

  afterAll(async () => {
    await prisma.membershipCard.deleteMany({ where: { memberId } });
    await prisma.subscription.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.membershipPlan.delete({ where: { id: planId } });
  });

  it("createSubscription creates a pending subscription and a card", async () => {
    const { subscriptionId } = await createSubscription(memberId, { planId }, prisma);

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub).toBeDefined();
    expect(sub?.status).toBe("PENDING");

    const cards = await prisma.membershipCard.findMany({ where: { subscriptionId } });
    expect(cards.length).toBe(1);
    expect(cards[0].isActive).toBe(false);
  });

  it("suspendSubscription sets status to SUSPENDED and streak to 0", async () => {
    const { subscriptionId } = await createSubscription(memberId, { planId }, prisma);
    
    // Set streak manually to simulate an active member
    await prisma.member.update({ where: { id: memberId }, data: { adimplenciaStreakMonths: 5 } });
    
    await suspendSubscription(subscriptionId, prisma);

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub?.status).toBe("SUSPENDED");

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    expect(member?.adimplenciaStreakMonths).toBe(0);

    const cards = await prisma.membershipCard.findMany({ where: { subscriptionId } });
    expect(cards.every(c => c.isActive === false)).toBe(true);
  });

  it("reactivateFromDelinquency sets status to ACTIVE, resets streak, creates new cards", async () => {
    const { subscriptionId } = await createSubscription(memberId, { planId }, prisma);
    
    await suspendSubscription(subscriptionId, prisma);
    
    // Member should have streak 0
    await prisma.member.update({ where: { id: memberId }, data: { adimplenciaStreakMonths: 5 } });
    
    await reactivateFromDelinquency(subscriptionId, prisma);

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub?.status).toBe("ACTIVE");

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    expect(member?.adimplenciaStreakMonths).toBe(0);

    const cards = await prisma.membershipCard.findMany({ where: { subscriptionId } });
    // It creates a new card and invalidates old ones, so there should be 2 cards (1 old inactive, 1 new active)
    expect(cards.length).toBe(2);
    const activeCards = cards.filter(c => c.isActive);
    expect(activeCards.length).toBe(1);
  });

  it("renewActiveSubscription leaves streak untouched and creates new cards", async () => {
    const { subscriptionId } = await createSubscription(memberId, { planId }, prisma);
    await reactivateFromDelinquency(subscriptionId, prisma);

    // Set streak manually
    await prisma.member.update({ where: { id: memberId }, data: { adimplenciaStreakMonths: 7 } });

    await renewActiveSubscription(subscriptionId, prisma);

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub?.status).toBe("ACTIVE");

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    expect(member?.adimplenciaStreakMonths).toBe(7); // Untouched
  });

  it("cancelSubscription sets status to CANCELLED and invalidates all cards", async () => {
    const { subscriptionId } = await createSubscription(memberId, { planId }, prisma);
    await reactivateFromDelinquency(subscriptionId, prisma);

    await cancelSubscription(subscriptionId, prisma);

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub?.status).toBe("CANCELLED");

    const cards = await prisma.membershipCard.findMany({ where: { subscriptionId } });
    expect(cards.every(c => c.isActive === false)).toBe(true);
  });
});
