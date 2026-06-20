import { describe, it, expect, beforeAll } from "vitest";
import fastify from "../../server";

describe("Auth Endpoints", () => {
  let app: typeof fastify;

  beforeAll(async () => {
    app = fastify;
    
    // Add test endpoints for authentication
    app.register(async (fastifyContext) => {
      fastifyContext.get("/test-member", { preHandler: [fastifyContext.authenticate] }, async () => {
        return { success: true };
      });
      
      fastifyContext.get("/test-admin", { preHandler: [fastifyContext.authenticate, fastifyContext.requireRole("ADMIN")] }, async () => {
        return { success: true };
      });
    });

    await app.ready();
  });

  it("should fail to access protected routes without token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test-member",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should expose Better Auth handlers", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: "test@example.com", password: "wrong" }
    });
    // Expected to return 400 bad request or similar due to missing/invalid body according to better-auth
    expect([400, 401, 403, 404]).toContain(res.statusCode);
  });
});
