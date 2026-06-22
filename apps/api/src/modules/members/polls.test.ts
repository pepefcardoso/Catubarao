import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import fastifyApp from "../../server";
import { prisma } from "@repo/db";

const request = supertest(fastifyApp.server);

describe("Polls and Voting Routes", () => {
  let adminToken: string;
  let adminId: string;
  let memberToken: string;
  let memberId: string;
  let seniorToken: string;
  let seniorId: string;

  beforeAll(async () => {
    await fastifyApp.ready();

    // Create Admin
    const adminData = {
      name: "Admin User",
      email: `admin.poll.${Date.now()}@example.com`,
      password: "password123",
      cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11),
      phone: "+5511999999901",
      birthDate: "1990-01-01",
    };

    await fastifyApp.inject({ method: "POST", url: "/auth/register", payload: adminData });
    const adminLogin = await fastifyApp.inject({ method: "POST", url: "/auth/login", payload: { email: adminData.email, password: adminData.password } });
    adminId = JSON.parse(adminLogin.payload).user.id;
    adminToken = (adminLogin.headers["set-cookie"] as string[])[0];

    // Make admin
    await prisma.member.update({ where: { id: adminId }, data: { role: "ADMIN" } });

    // Create Member (no seniority)
    const memberData = {
      name: "Normal Member",
      email: `member.poll.${Date.now()}@example.com`,
      password: "password123",
      cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11),
      phone: "+5511999999902",
      birthDate: "1990-01-01",
    };

    await fastifyApp.inject({ method: "POST", url: "/auth/register", payload: memberData });
    const memberLogin = await fastifyApp.inject({ method: "POST", url: "/auth/login", payload: { email: memberData.email, password: memberData.password } });
    memberId = JSON.parse(memberLogin.payload).user.id;
    memberToken = (memberLogin.headers["set-cookie"] as string[])[0];

    // Create Senior Member (high seniority)
    const seniorData = {
      name: "Senior Member",
      email: `senior.poll.${Date.now()}@example.com`,
      password: "password123",
      cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11),
      phone: "+5511999999903",
      birthDate: "1990-01-01",
    };

    await fastifyApp.inject({ method: "POST", url: "/auth/register", payload: seniorData });
    const seniorLogin = await fastifyApp.inject({ method: "POST", url: "/auth/login", payload: { email: seniorData.email, password: seniorData.password } });
    seniorId = JSON.parse(seniorLogin.payload).user.id;
    seniorToken = (seniorLogin.headers["set-cookie"] as string[])[0];

    await prisma.member.update({ where: { id: seniorId }, data: { adimplenciaStreakMonths: 15 } });
  });

  afterAll(async () => {
    // cleanup
    await prisma.pollVote.deleteMany({});
    await prisma.poll.deleteMany({});
    await prisma.session.deleteMany({ where: { userId: { in: [adminId, memberId, seniorId] } } });
    await prisma.member.deleteMany({ where: { id: { in: [adminId, memberId, seniorId] } } });
    await fastifyApp.close();
  });

  let regularPollId: string;
  let seniorityPollId: string;

  it("POST /admin/polls fails if not admin", async () => {
    const res = await request
      .post("/admin/polls")
      .set("Cookie", memberToken)
      .send({
        title: "Test Poll",
        description: "Test description",
        options: [{ id: "opt1", text: "Option 1" }, { id: "opt2", text: "Option 2" }],
        opensAt: new Date().toISOString(),
        closesAt: new Date(Date.now() + 100000).toISOString(),
        quorumMinimum: 10,
        requiresSeniority: false
      });
    expect(res.status).toBe(403);
  });

  it("POST /admin/polls creates a regular poll", async () => {
    const res = await request
      .post("/admin/polls")
      .set("Cookie", adminToken)
      .send({
        title: "Regular Poll",
        description: "Test description",
        options: [{ id: "opt1", text: "Option 1" }, { id: "opt2", text: "Option 2" }],
        opensAt: new Date().toISOString(),
        closesAt: new Date(Date.now() + 100000).toISOString(),
        quorumMinimum: 1,
        requiresSeniority: false
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    regularPollId = res.body.id;
  });

  it("POST /admin/polls creates a seniority poll", async () => {
    const res = await request
      .post("/admin/polls")
      .set("Cookie", adminToken)
      .send({
        title: "Seniority Poll",
        description: "Test description",
        options: [{ id: "opt1", text: "Option 1" }, { id: "opt2", text: "Option 2" }],
        opensAt: new Date().toISOString(),
        closesAt: new Date(Date.now() + 100000).toISOString(),
        quorumMinimum: 1,
        requiresSeniority: true
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    seniorityPollId = res.body.id;
  });

  it("GET /polls returns open polls", async () => {
    const res = await request.get("/polls");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /polls/:id/vote casts a vote on regular poll", async () => {
    const res = await request
      .post(`/polls/${regularPollId}/vote`)
      .set("Cookie", memberToken)
      .send({ optionId: "opt1" });
    expect(res.status).toBe(204);
  });

  it("POST /polls/:id/vote twice returns 409 Conflict", async () => {
    const res = await request
      .post(`/polls/${regularPollId}/vote`)
      .set("Cookie", memberToken)
      .send({ optionId: "opt2" });
    expect(res.status).toBe(409);
  });

  it("POST /polls/:id/vote on seniority poll fails with 403 for non-senior", async () => {
    const res = await request
      .post(`/polls/${seniorityPollId}/vote`)
      .set("Cookie", memberToken)
      .send({ optionId: "opt1" });
    expect(res.status).toBe(403);
  });

  it("POST /polls/:id/vote on seniority poll succeeds for senior", async () => {
    const res = await request
      .post(`/polls/${seniorityPollId}/vote`)
      .set("Cookie", seniorToken)
      .send({ optionId: "opt1" });
    expect(res.status).toBe(204);
  });

  it("GET /polls/:id returns vote counts but no results yet", async () => {
    const res = await request.get(`/polls/${seniorityPollId}`);
    expect(res.status).toBe(200);
    expect(res.body.voteCounts).toHaveProperty("opt1", 1);
  });

  it("GET /polls/:id/result returns 422 if not closed", async () => {
    const res = await request.get(`/polls/${regularPollId}/result`);
    expect(res.status).toBe(422);
  });

  it("GET /polls/:id/result returns quorumReached if closed", async () => {
    // Manually close the poll to simulate background job
    await prisma.poll.update({ where: { id: regularPollId }, data: { status: "CLOSED" } });

    const res = await request.get(`/polls/${regularPollId}/result`);
    expect(res.status).toBe(200);
    expect(res.body.quorumReached).toBe(true);
  });
});
