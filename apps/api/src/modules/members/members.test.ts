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
});
