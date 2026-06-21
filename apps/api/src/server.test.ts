import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import fastify from "./server";
import { ConflictError } from "./lib/errors";

describe("Fastify API Bootstrap", () => {
  beforeAll(async () => {
    // Add a test route to verify the error handler
    fastify.get("/test-error", async () => {
      throw new ConflictError("Test conflict error");
    });

    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("should return 200 on /health", async () => {
    const response = await supertest(fastify.server).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("timestamp");
  });

  it("should map ConflictError to 409", async () => {
    const response = await supertest(fastify.server).get("/test-error");
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error", "ConflictError");
    expect(response.body).toHaveProperty("message", "Test conflict error");
  });
});
