import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import fastifyApp from "../../server";
import { prisma } from "@repo/db";

const request = supertest(fastifyApp.server);

describe("Members Profile Routes", () => {
  let memberToken: string;
  let memberId: string;

  beforeAll(async () => {
    await fastifyApp.ready();

    // Create a dummy user
    const memberData = {
      name: "Test Member",
      email: `test.profile.${Date.now()}@example.com`,
      password: "password123",
      cpf: Math.floor(10000000000 + Math.random() * 90000000000)
        .toString()
        .substring(0, 11),
      phone: "+5511999999999",
      birthDate: "1990-01-01",
    };

    // Register the user
    await fastifyApp.inject({
      method: "POST",
      url: "/auth/register",
      payload: memberData,
    });

    // Login to get session
    const loginRes = await fastifyApp.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: memberData.email,
        password: memberData.password,
      },
    });

    const body = JSON.parse(loginRes.payload);
    memberId = body.user.id;

    const cookies = loginRes.headers["set-cookie"];
    memberToken = Array.isArray(cookies) ? cookies[0] : cookies || "";
  });

  afterAll(async () => {
    // cleanup
    await prisma.session.deleteMany({ where: { userId: memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await fastifyApp.close();
  });

  it("GET /members/me without authentication returns 401", async () => {
    const res = await request.get("/members/me");
    expect(res.status).toBe(401);
  });

  it("GET /members/me returns member profile and calculated streak", async () => {
    const res = await request.get("/members/me").set("Cookie", memberToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", memberId);
    expect(res.body).toHaveProperty("name", "Test Member");
    expect(res.body).toHaveProperty("adimplenciaStreak", 0);
  });

  it("PATCH /members/me without authentication returns 401", async () => {
    const res = await request.patch("/members/me").send({ name: "New Name" });
    expect(res.status).toBe(401);
  });

  it("PATCH /members/me with { cpf: '...' } returns 403", async () => {
    const res = await request
      .patch("/members/me")
      .set("Cookie", memberToken)
      .send({ cpf: "22222222222" });

    expect(res.status).toBe(403);
  });

  it("PATCH /members/me with valid fields updates and returns updated profile", async () => {
    const res = await request.patch("/members/me").set("Cookie", memberToken).send({
      name: "Updated Member",
      phone: "5511999999999",
      showOnMonument: true,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Member");
    expect(res.body).toHaveProperty("showOnMonument", true);

    const dbMember = await prisma.member.findUnique({ where: { id: memberId } });
    expect(dbMember?.name).toBe("Updated Member");
    expect(dbMember?.showOnMonument).toBe(true);
  });

  describe("Membership Cards", () => {
    let subscriptionId: string;

    beforeAll(async () => {
      // Create a plan and subscription for the member
      const plan = await prisma.membershipPlan.create({
        data: {
          name: "Test Plan",
          price: 100,
          interval: "MONTHLY",
          benefits: [],
        }
      });

      const subscription = await prisma.subscription.create({
        data: {
          memberId,
          planId: plan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      });
      subscriptionId = subscription.id;

      // Mock the keys for the test
      const { generateKeyPair, exportPKCS8, exportSPKI } = await import("jose");
      const { publicKey, privateKey } = await generateKeyPair("ES256");
      process.env.QR_PRIVATE_KEY = await exportPKCS8(privateKey);
      process.env.QR_PUBLIC_KEY = await exportSPKI(publicKey);
    });

    afterAll(async () => {
      await prisma.subscription.deleteMany({ where: { memberId } });
      await prisma.membershipPlan.deleteMany({ where: { name: "Test Plan" } });
    });

    it("GET /members/me/card returns 404 when no card exists", async () => {
      const res = await request.get("/members/me/card").set("Cookie", memberToken);
      expect(res.status).toBe(404);
    });

    it("POST /members/:id/card/rotate fails for non-admin", async () => {
      const res = await request.post(`/members/${memberId}/card/rotate`).set("Cookie", memberToken);
      expect(res.status).toBe(403);
    });

    it("should allow card generation, rotating, and getting active card", async () => {
      const { generateMembershipCard } = await import("./members.service");
      
      // 1. Generate an initial card manually via service
      const card1 = await generateMembershipCard(memberId, subscriptionId, prisma);
      expect(card1.isActive).toBe(true);

      // 2. Fetch the card via endpoint
      const res1 = await request.get("/members/me/card").set("Cookie", memberToken);
      expect(res1.status).toBe(200);
      expect(res1.body.id).toBe(card1.id);
      expect(res1.body.qrToken).toBe(card1.qrToken);

      // 3. Temporarily make the user an admin
      await prisma.member.update({
        where: { id: memberId },
        data: { role: "ADMIN" }
      });

      // 4. Rotate the card
      const resRotate = await request.post(`/members/${memberId}/card/rotate`).set("Cookie", memberToken);
      expect(resRotate.status).toBe(200);
      const card2 = resRotate.body;
      expect(card2.id).not.toBe(card1.id);
      expect(card2.isActive).toBe(true);

      // 5. Verify the old card is invalidated
      const oldCard = await prisma.membershipCard.findUnique({ where: { id: card1.id } });
      expect(oldCard?.isActive).toBe(false);

      // 6. Fetch the new active card
      const res2 = await request.get("/members/me/card").set("Cookie", memberToken);
      expect(res2.status).toBe(200);
      expect(res2.body.id).toBe(card2.id);

      // Remove admin role
      await prisma.member.update({
        where: { id: memberId },
        data: { role: null }
      });
    });

    it("GET /members/me/card returns 404 for a suspended member", async () => {
      // Suspend the subscription
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: "SUSPENDED" }
      });

      // Invalidate existing active cards to simulate suspension logic which usually drops them
      await prisma.membershipCard.updateMany({
        where: { subscriptionId },
        data: { isActive: false }
      });

      const res = await request.get("/members/me/card").set("Cookie", memberToken);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Card not found or suspended");
    });
  });
});

import { isEligibleToVote } from "./members.service";

describe("isEligibleToVote helper", () => {
  it("should return false for member with 11 months streak", () => {
    expect(isEligibleToVote({ adimplenciaStreakMonths: 11 })).toBe(false);
  });

  it("should return true for member with 12 months streak", () => {
    expect(isEligibleToVote({ adimplenciaStreakMonths: 12 })).toBe(true);
  });

  it("should return true for member with 13 months streak", () => {
    expect(isEligibleToVote({ adimplenciaStreakMonths: 13 })).toBe(true);
  });

  it("should return false for member with 0 months streak", () => {
    expect(isEligibleToVote({ adimplenciaStreakMonths: 0 })).toBe(false);
  });
});
