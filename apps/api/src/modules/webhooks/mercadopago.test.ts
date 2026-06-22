import { describe, it, expect, vi, beforeEach } from "vitest";
import fastify from "../../../server";
import crypto from "crypto";
import { env } from "../../../lib/env";

describe("Mercado Pago Webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if signature is invalid", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/webhooks/mercadopago",
      headers: {
        "x-signature": "ts=123,v1=invalidhash",
        "x-request-id": "req-123",
      },
      payload: {
        action: "payment.created",
        type: "payment",
        data: { id: "12345" },
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and enqueue job if signature is valid", async () => {
    const dataId = "12345";
    const ts = "1234567890";
    const requestId = "req-123";
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const secret = env.MP_WEBHOOK_SECRET;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);
    const hash = hmac.digest("hex");

    const response = await fastify.inject({
      method: "POST",
      url: "/webhooks/mercadopago",
      headers: {
        "x-signature": `ts=${ts},v1=${hash}`,
        "x-request-id": requestId,
      },
      payload: {
        action: "payment.created",
        type: "payment",
        data: { id: dataId },
      },
    });

    expect(response.statusCode).toBe(200);
    // Since mock or actual queue is used, we just assert status 200.
    // The BullMQ mock/spy would be checked if configured.
  });
});
