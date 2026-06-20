import { describe, it, expect, vi } from "vitest";
import { getUploadUrl, getDownloadUrl, deleteObject, buildStorageKey, r2 } from "./storage";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

vi.mock("./env", () => ({
  env: {
    R2_ENDPOINT: "https://mock.r2.com",
    R2_ACCESS_KEY_ID: "mock-key",
    R2_SECRET_ACCESS_KEY: "mock-secret",
    R2_BUCKET: "mock-bucket",
  },
}));

describe("storage utility", () => {
  it("buildStorageKey matches pattern", () => {
    const key = buildStorageKey("transparency", "uuid-123", "doc.pdf");
    expect(key).toMatch(/^transparency\/uuid-123\/\d+-doc\.pdf$/);
  });

  it("getUploadUrl generates a valid presigned URL with the correct endpoint and key", async () => {
    const url = await getUploadUrl("test-key", "application/pdf");
    expect(url).toContain("mock.r2.com");
    expect(url).toContain("mock-bucket");
    expect(url).toContain("test-key");
    expect(url).toContain("X-Amz-Signature=");
  });

  it("getDownloadUrl generates a valid presigned URL with the correct endpoint and key", async () => {
    const url = await getDownloadUrl("test-key");
    expect(url).toContain("mock.r2.com");
    expect(url).toContain("mock-bucket");
    expect(url).toContain("test-key");
    expect(url).toContain("X-Amz-Signature=");
  });

  it("deleteObject calls r2.send with DeleteObjectCommand and correct bucket/key", async () => {
    vi.spyOn(r2, "send").mockImplementation(async () => ({}) as any);

    await deleteObject("test-key");
    expect(r2.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: "mock-bucket",
          Key: "test-key",
        }),
      })
    );
  });
});
