import { describe, it, expect, beforeAll } from "vitest";
import { generateCardToken, verifyCardToken } from "./qr";
import { generateKeyPair, exportPKCS8, exportSPKI } from "jose";

describe("QR Library", () => {
  beforeAll(async () => {
    // Generate an ES256 keypair for testing
    const { publicKey, privateKey } = await generateKeyPair("ES256");
    process.env.QR_PRIVATE_KEY = await exportPKCS8(privateKey);
    process.env.QR_PUBLIC_KEY = await exportSPKI(publicKey);
  });

  it("should generate and verify JWT token correctly", async () => {
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1); // 1 year from now

    const payload = {
      memberId: "test-member-123",
      planId: "test-plan-456",
      tier: "Ouro",
      validUntil: validUntil.toISOString(),
      status: "ACTIVE" as const,
    };

    // 1. Generate JWT containing the specified payload
    const token = await generateCardToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    // 2. Token verifies offline using only the public key
    const verified = await verifyCardToken(token);
    
    expect(verified.payload.memberId).toBe(payload.memberId);
    expect(verified.payload.planId).toBe(payload.planId);
    expect(verified.payload.tier).toBe(payload.tier);
    expect(verified.payload.validUntil).toBe(payload.validUntil);
    expect(verified.payload.status).toBe("ACTIVE");
  });
});
