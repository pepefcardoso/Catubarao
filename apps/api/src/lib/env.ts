import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });


const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),
  MP_ACCESS_TOKEN: z.string(),
  MP_WEBHOOK_SECRET: z.string(),
  MP_PUBLIC_KEY: z.string(),
  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET: z.string(),
  R2_PUBLIC_URL: z.string().url(),
  QR_PRIVATE_KEY: z.string(),
  QR_PUBLIC_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_FROM: z.string(),
  WHATSAPP_SUPPORT_NUMBER: z.string().min(1),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const dummyTestEnv = {
  DATABASE_URL: "postgresql://tubarao:password@localhost:5432/tubarao",
  DIRECT_URL: "postgresql://tubarao:password@localhost:5432/tubarao",
  REDIS_HOST: "localhost",
  REDIS_PORT: "6379",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:3001",
  MP_ACCESS_TOKEN: "TEST-1234567890",
  MP_WEBHOOK_SECRET: "test-secret",
  MP_PUBLIC_KEY: "TEST-1234567890",
  R2_ENDPOINT: "http://localhost:9000",
  R2_ACCESS_KEY_ID: "test-key",
  R2_SECRET_ACCESS_KEY: "test-secret",
  R2_BUCKET: "test-bucket",
  R2_PUBLIC_URL: "http://localhost:9000/test-bucket",
  QR_PRIVATE_KEY: "test-private-key",
  QR_PUBLIC_KEY: "test-public-key",
  RESEND_API_KEY: "re_test_123456789",
  RESEND_FROM: "onboarding@resend.dev",
  WHATSAPP_SUPPORT_NUMBER: "5548999990000",
};

if (process.env.NODE_ENV === "test") {
  Object.assign(process.env, dummyTestEnv);
}

const parsed =
  process.env.NODE_ENV === "test"
    ? { success: true, data: process.env as any }
    : envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    "error" in parsed ? JSON.stringify((parsed as any).error.format(), null, 2) : "Unknown error",
  );
  process.exit(1);
}

export const env = parsed.data;
