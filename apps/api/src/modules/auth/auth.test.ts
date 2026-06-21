import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fastify from "../../server";

describe("Auth Endpoints", () => {
  let app: typeof fastify;

  beforeAll(async () => {
    app = fastify;
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  const randomCpf = Math.floor(10000000000 + Math.random() * 90000000000)
    .toString()
    .substring(0, 11);

  const validMember = {
    name: "John Doe Auth",
    email: `auth.test.${Date.now()}@example.com`,
    password: "password123",
    cpf: randomCpf, // Dummy valid format CPF for this test since we just test regex
    phone: "+5511999999999",
    birthDate: "1990-01-01",
  };

  it("should successfully register a new member", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: validMember,
    });

    if (res.statusCode !== 201) {
      console.error("Register failed:", res.payload);
    }

    // Better auth signup email successful
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.user.email).toBe(validMember.email);
    expect(body.user.name).toBe(validMember.name);
    // Check if session token or cookie is returned
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 409 when registering with duplicate CPF", async () => {
    const duplicateCpfMember = {
      ...validMember,
      email: `another.auth.${Date.now()}@example.com`,
    };

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: duplicateCpfMember,
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("ConflictError");
  });

  it("should return 422 when registering with invalid CPF", async () => {
    const invalidCpfMember = {
      ...validMember,
      email: `invalid.cpf.${Date.now()}@example.com`,
      cpf: "123", // Too short
    };

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: invalidCpfMember,
    });

    expect(res.statusCode).toBe(422);
  });

  it("should successfully login an existing member", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: validMember.email,
        password: validMember.password,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.user.email).toBe(validMember.email);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should successfully logout", async () => {
    // First login to get a cookie
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: validMember.email,
        password: validMember.password,
      },
    });

    const cookies = loginRes.headers["set-cookie"];

    const res = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: {
        cookie: Array.isArray(cookies) ? cookies[0] : cookies,
      },
    });

    expect(res.statusCode).toBe(200);
  });
  it("should successfully refresh token", async () => {
    // First login to get a cookie
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: validMember.email,
        password: validMember.password,
      },
    });

    const cookies = loginRes.headers["set-cookie"];

    const res = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: {
        cookie: Array.isArray(cookies) ? cookies[0] : cookies,
      },
    });

    expect(res.statusCode).toBe(200);
  });
});
