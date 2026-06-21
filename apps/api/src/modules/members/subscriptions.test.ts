import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import supertest from "supertest";
import fastifyApp from "../../server";
import { prisma } from "@repo/db";
import { mp } from "../../lib/mercadopago";

vi.mock("../../lib/mercadopago", () => ({
  mp: {
    preApproval: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const request = supertest(fastifyApp.server);

describe("Subscriptions Routes", () => {
  let memberToken: string;
  let memberId: string;
  let regularPlanId: string;
  let corporatePlanId: string;
  let subscriptionId: string;

  beforeAll(async () => {
    await fastifyApp.ready();

    // Create dummy user
    const memberData = {
      name: "Sub Test Member",
      email: `sub.test.${Date.now()}@example.com`,
      password: "password123",
      cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11),
      phone: "+5511999999999",
      birthDate: "1990-01-01",
    };

    await fastifyApp.inject({
      method: "POST",
      url: "/auth/register",
      payload: memberData,
    });

    const loginRes = await fastifyApp.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: memberData.email, password: memberData.password },
    });

    const body = JSON.parse(loginRes.payload);
    memberId = body.user.id;
    const cookies = loginRes.headers["set-cookie"];
    memberToken = Array.isArray(cookies) ? cookies[0] : cookies || "";

    // Create Plans
    const p1 = await prisma.membershipPlan.create({
      data: {
        name: "Regular Plan",
        price: 50,
        interval: "MONTHLY",
        benefits: ["Benefit 1"],
      },
    });
    regularPlanId = p1.id;

    const p2 = await prisma.membershipPlan.create({
      data: {
        name: "Corporate Plan",
        price: 500,
        interval: "ANNUAL",
        benefits: ["Benefit 1"],
        isCorporate: true,
        maxCards: 5,
      },
    });
    corporatePlanId = p2.id;
  });

  afterAll(async () => {
    await prisma.membershipCard.deleteMany({ where: { memberId } });
    await prisma.subscription.deleteMany({ where: { memberId } });
    await prisma.membershipPlan.deleteMany({ where: { id: { in: [regularPlanId, corporatePlanId] } } });
    await prisma.session.deleteMany({ where: { userId: memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await fastifyApp.close();
  });

  it("POST /subscriptions creates subscription and returns MP checkout URL", async () => {
    (mp.preApproval.create as any).mockResolvedValueOnce({
      id: "mp-sub-123",
      init_point: "https://mp.local/checkout",
    });

    const res = await request
      .post("/subscriptions")
      .set("Cookie", memberToken)
      .send({ planId: regularPlanId });

    if (res.status !== 201) console.error("DEBUG_ERROR:", res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("subscriptionId");
    expect(res.body).toHaveProperty("checkoutUrl", "https://mp.local/checkout");

    subscriptionId = res.body.subscriptionId;

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub?.status).toBe("PENDING");
    expect(sub?.gatewaySubscriptionId).toBe("mp-sub-123");
  });

  it("POST /subscriptions with existing active subscription returns 409", async () => {
    // Manually set existing to ACTIVE
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "ACTIVE" },
    });

    const res = await request
      .post("/subscriptions")
      .set("Cookie", memberToken)
      .send({ planId: corporatePlanId });

    expect(res.status).toBe(409);
  });

  it("PATCH /subscriptions/:id/plan upgrades/downgrades plan", async () => {
    (mp.preApproval.update as any).mockResolvedValueOnce({});
    (mp.preApproval.create as any).mockResolvedValueOnce({
      id: "mp-sub-new",
      init_point: "https://mp.local/checkout-new",
    });

    const res = await request
      .patch(`/subscriptions/${subscriptionId}/plan`)
      .set("Cookie", memberToken)
      .send({ planId: corporatePlanId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("checkoutUrl", "https://mp.local/checkout-new");

    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    expect(sub?.planId).toBe(corporatePlanId);
    expect(sub?.gatewaySubscriptionId).toBe("mp-sub-new");
  });

  it("DELETE /subscriptions/:id cancels subscription and corporate slots", async () => {
    (mp.preApproval.update as any).mockResolvedValueOnce({});

    await prisma.subscription.delete({ where: { id: subscriptionId } });

    (mp.preApproval.create as any).mockResolvedValueOnce({
      id: "mp-corp-1",
      init_point: "https://mp.local/checkout-corp",
    });

    const createRes = await request
      .post("/subscriptions")
      .set("Cookie", memberToken)
      .send({ planId: corporatePlanId });

    const corpSubId = createRes.body.subscriptionId;

    // Verify slots were created
    const cards = await prisma.membershipCard.findMany({ where: { subscriptionId: corpSubId } });
    expect(cards.length).toBe(5);
    expect(cards.every(c => c.isActive === false)).toBe(true);

    // Now delete
    const delRes = await request
      .delete(`/subscriptions/${corpSubId}`)
      .set("Cookie", memberToken);

    expect(delRes.status).toBe(200);

    const sub = await prisma.subscription.findUnique({ where: { id: corpSubId } });
    expect(sub?.status).toBe("CANCELLED");

    const cardsAfter = await prisma.membershipCard.findMany({ where: { subscriptionId: corpSubId } });
    expect(cardsAfter.every(c => c.isActive === false)).toBe(true);
  });
});
