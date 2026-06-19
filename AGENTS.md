# AGENTS.md

This file is the single source of truth for any AI agent working on this codebase.
Read it entirely before writing any code. Every rule here exists for a reason — do not
override, simplify, or "improve" anything without an explicit instruction from the developer.

---

## 1. Project Context

**Club:** Clube Atlético Tubarão Saf (Santa Catarina, Brazil)  
**Legal structure:** SAF (Sociedade Anônima do Futebol) + Associação (hybrid, coexisting)  
**Financial context:** Club is under RCE (Regime Centralizado de Execuções, Lei 14.193/2021).
This means there is a court-supervised debt repayment plan in place. Financial discipline is
not a preference — it is a legal obligation. Any feature that touches money, debt data, or
member records must be treated with the same rigor as financial system code.

**Spec:** `spec.md` at the repository root is the source of truth for business requirements.
If there is a conflict between spec.md and any code you find, the spec wins. If there is a
conflict between spec.md and this file, ask the developer before proceeding.
If there is a conflict between spec.md and BACKLOG.md, spec.md wins; document the resolution in `docs/adr/`.

**Product modules (in priority order):**
1. Sócio-Torcedor (membership)
2. Portal de Transparência (transparency portal)
3. CRM de Parceiros/Permutas (partner CRM)
4. Loja (store)
5. Matchday / Ingressos (Phase 2 — do not implement unless explicitly instructed)

---

## 2. Repository Structure

```
/
├── AGENTS.md                  ← you are here
├── spec.md                    ← business requirements (source of truth)
├── docs/
│   ├── adr/                   ← Architecture Decision Records
│   ├── acceptance/            ← Gherkin acceptance tests by module
│   └── webhooks/              ← Mercado Pago payload reference
├── apps/
│   ├── web/                   ← Next.js 15 (App Router)
│   │   ├── app/               ← routes (App Router convention)
│   │   │   ├── (public)/      ← transparency portal, landing
│   │   │   ├── (member)/      ← member dashboard (auth required)
│   │   │   ├── (admin)/       ← admin panel (ADMIN role required)
│   │   │   └── (store)/       ← loja
│   │   ├── components/        ← page-level components
│   │   └── lib/               ← web-specific utilities
│   └── api/                   ← Fastify 5
│       ├── src/
│       │   ├── modules/       ← one folder per domain module
│       │   │   ├── members/
│       │   │   ├── transparency/
│       │   │   ├── partners/
│       │   │   ├── store/
│       │   │   └── webhooks/
│       │   ├── plugins/       ← Fastify plugins (auth, redis, queues)
│       │   ├── jobs/          ← BullMQ job definitions and processors
│       │   └── server.ts      ← entry point
├── packages/
│   ├── db/                    ← Prisma schema + generated client
│   │   ├── prisma/
│   │   │   └── schema.prisma  ← SINGLE source of truth for data model
│   │   └── index.ts           ← exports PrismaClient singleton
│   ├── schemas/               ← Zod schemas (shared between web and api)
│   │   └── src/
│   │       ├── member.ts
│   │       ├── transparency.ts
│   │       ├── partner.ts
│   │       ├── store.ts
│   │       └── index.ts
│   ├── ui/                    ← shadcn/ui components + custom components
│   └── config/                ← shared tsconfig, eslint config
├── docker-compose.yml
├── docker-compose.override.yml ← local dev overrides (gitignored)
├── .env.example
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 22 LTS |
| Language | TypeScript | 5.x (strict mode) |
| Package manager | pnpm | 9.x |
| Monorepo | Turborepo | 2.x |
| Frontend | Next.js (App Router) | 15.x |
| UI | Tailwind CSS + shadcn/ui | 4.x / latest |
| API | Fastify | 5.x |
| Validation | Zod | 3.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| Connection pool | PgBouncer | latest |
| Cache | Redis | 7 (Alpine) |
| Queue | BullMQ | 5.x |
| Auth | Better Auth | latest |
| File storage | Cloudflare R2 (S3-compatible) | — |
| Email | Resend + React Email | latest |
| PDF generation | @react-pdf/renderer | 4.x |
| Payment gateway | Mercado Pago SDK | latest |
| Error tracking | Sentry | latest |
| Logging | Pino (Fastify built-in) | — |
| Testing | Vitest + Supertest | 2.x / latest |
| Reverse proxy | Caddy | 2.x |
| CI/CD | GitHub Actions | — |

---

## 4. Development Setup

```bash
# clone and install
git clone <repo>
pnpm install

# environment
cp .env.example .env.local
# fill in required values (see section 10)

# start infrastructure (postgres, redis, pgbouncer)
docker compose up postgres pgbouncer redis -d

# run prisma migrations
pnpm db:migrate

# seed development data
pnpm db:seed

# start all apps in development mode
pnpm dev

# start individual app
pnpm --filter web dev
pnpm --filter api dev
```

---

## 5. Commands Reference

Run all commands from the repository root unless noted otherwise.

```bash
# development
pnpm dev                    # start all apps (turbo)
pnpm build                  # build all apps (turbo)
pnpm lint                   # lint all packages
pnpm typecheck              # tsc --noEmit on all packages

# database
pnpm db:migrate             # apply pending migrations (dev)
pnpm db:migrate:prod        # apply migrations (production — CI only)
pnpm db:seed                # seed dev data
pnpm db:studio              # open Prisma Studio
pnpm db:generate            # regenerate Prisma client after schema change
pnpm db:reset               # drop + recreate + migrate + seed (dev only)

# testing
pnpm test                   # run all tests (turbo)
pnpm test:watch             # watch mode
pnpm --filter api test      # run API tests only

# code quality
pnpm format                 # prettier --write
pnpm lint:fix               # eslint --fix

# docker
docker compose up -d        # start all services
docker compose down -v      # stop and remove volumes (destroys data)
docker compose logs api -f  # tail api logs
```

---

## 6. Architecture Patterns

### 6.1 Zod schemas as the single source of truth

Zod schemas live in `packages/schemas`. They are the definition layer. Do not duplicate
type definitions anywhere else.

```typescript
// packages/schemas/src/member.ts

import { z } from "zod";

export const CreateMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  cpf: z.string().regex(/^\d{11}$/, "CPF must be 11 digits, no formatting"),
  phone: z.string().min(10).max(15),
  birthDate: z.string().date(),
  referralCode: z.string().optional(),
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
```

```typescript
// apps/api/src/modules/members/members.routes.ts
// Import from @repo/schemas — never redefine inline

import { CreateMemberSchema } from "@repo/schemas/member";

fastify.post("/members", {
  schema: {
    body: zodToJsonSchema(CreateMemberSchema),
  },
  handler: createMemberHandler,
});
```

```typescript
// apps/web/app/(public)/signup/page.tsx
// Same schema reused for form validation

import { CreateMemberSchema } from "@repo/schemas/member";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

**Rule:** if you need a type that doesn't exist in `packages/schemas`, add it there first,
then import it. Never define `z.object(...)` inline in a route handler or component.

---

### 6.2 Fastify route structure

One file per resource, following this exact structure:

```typescript
// apps/api/src/modules/members/members.routes.ts

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateMemberSchema } from "@repo/schemas/member";
import { createMember } from "./members.service";

export const membersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/",
    {
      schema: {
        tags: ["members"],
        body: CreateMemberSchema,
        response: {
          201: MemberResponseSchema,
          409: ErrorSchema,
          422: ErrorSchema,
        },
      },
      preHandler: [fastify.authenticate], // auth hook from plugin
    },
    async (request, reply) => {
      const member = await createMember(request.body, fastify.prisma);
      return reply.status(201).send(member);
    }
  );
};
```

Business logic always goes in `*.service.ts`, never in the route handler.
The handler is only responsible for: extracting request data, calling the service, sending the response.

```typescript
// apps/api/src/modules/members/members.service.ts

import type { PrismaClient } from "@repo/db";
import type { CreateMemberInput } from "@repo/schemas/member";
import { validateCpf } from "../../lib/cpf";
import { ConflictError } from "../../lib/errors";

export async function createMember(
  input: CreateMemberInput,
  db: PrismaClient
) {
  if (!validateCpf(input.cpf)) {
    throw new ValidationError("Invalid CPF");
  }

  const existing = await db.member.findUnique({ where: { cpf: input.cpf } });
  if (existing) {
    throw new ConflictError("CPF already registered");
  }

  // ... rest of logic
}
```

---

### 6.3 Webhook handling pattern

Webhooks from Mercado Pago must respond `200` within 500ms. Always enqueue — never process synchronously.

```typescript
// apps/api/src/modules/webhooks/mercadopago.routes.ts

fastify.post("/webhooks/mercadopago", {
  config: { rawBody: true }, // required for signature verification
  schema: { body: MercadoPagoWebhookSchema },
  handler: async (request, reply) => {
    // 1. verify signature — reject immediately if invalid
    const isValid = verifyMercadoPagoSignature(
      request.rawBody,
      request.headers["x-signature"],
      request.headers["x-request-id"],
    );
    if (!isValid) return reply.status(401).send();

    // 2. enqueue — do not process here
    await fastify.queues.payments.add("process-payment-event", {
      type: request.body.type,
      data: request.body.data,
      receivedAt: new Date().toISOString(),
    });

    // 3. respond immediately
    return reply.status(200).send();
  },
});
```

```typescript
// apps/api/src/jobs/process-payment-event.ts

import type { Job } from "bullmq";
import { updateSubscriptionStatus } from "../modules/members/subscriptions.service";

export async function processPaymentEventJob(job: Job) {
  const { type, data } = job.data;

  switch (type) {
    case "payment.approved":
      await updateSubscriptionStatus(data.id, "ACTIVE");
      break;
    case "payment.rejected":
    case "payment.cancelled":
      await updateSubscriptionStatus(data.id, "PENDING");
      break;
    // handle other events
  }
}
```

---

### 6.4 Background jobs pattern

Define job types in `apps/api/src/jobs/`. Register all queues in the BullMQ plugin.

```typescript
// apps/api/src/plugins/queues.ts

import fp from "fastify-plugin";
import { Queue, Worker } from "bullmq";
import { processPaymentEventJob } from "../jobs/process-payment-event";
import { sendEmailJob } from "../jobs/send-email";

export default fp(async (fastify) => {
  const connection = { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) };

  const queues = {
    payments: new Queue("payments", { connection }),
    email: new Queue("email", { connection }),
    notifications: new Queue("notifications", { connection }),
  };

  // Workers
  new Worker("payments", processPaymentEventJob, { connection, concurrency: 5 });
  new Worker("email", sendEmailJob, { connection, concurrency: 10 });

  fastify.decorate("queues", queues);
});
```

Job naming convention: `verb-noun` in kebab-case.
Examples: `process-payment-event`, `send-welcome-email`, `generate-debt-snapshot`.

---

### 6.5 Database access pattern

Always use the Prisma client from `packages/db`. Never instantiate `new PrismaClient()` anywhere else.

```typescript
// packages/db/index.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
```

Use transactions for any operation that writes to more than one table:

```typescript
// correct — atomic
await db.$transaction(async (tx) => {
  const subscription = await tx.subscription.update({ ... });
  await tx.membershipCard.update({ where: { subscriptionId: subscription.id }, data: { isActive: false } });
  await tx.membershipCard.create({ data: { ...newCard } });
});

// wrong — non-atomic, leaves DB in inconsistent state on partial failure
await db.subscription.update({ ... });
await db.membershipCard.update({ ... }); // if this throws, subscription is updated but card is not
```

---

### 6.6 Auth pattern

Auth is handled by Better Auth. Do not implement custom JWT logic.

Protected routes use the `fastify.authenticate` preHandler (injected by the Better Auth plugin).
Role-based access uses `fastify.requireRole("ADMIN")`.

```typescript
// member route — any authenticated user
fastify.get("/me", {
  preHandler: [fastify.authenticate],
  handler: getMeHandler,
});

// admin route — ADMIN role required
fastify.get("/admin/members", {
  preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
  handler: listMembersHandler,
});
```

On the frontend, use Better Auth's React hooks:

```typescript
import { useSession } from "@/lib/auth-client";

const { data: session } = useSession();
```

---

### 6.7 Error handling pattern

Custom error classes live in `apps/api/src/lib/errors.ts`. Use them everywhere in service files.
Fastify's error handler maps them to HTTP responses.

```typescript
// apps/api/src/lib/errors.ts
export class ValidationError extends Error {
  statusCode = 422;
  constructor(message: string) { super(message); this.name = "ValidationError"; }
}
export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string) { super(message); this.name = "ConflictError"; }
}
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) { super(message); this.name = "NotFoundError"; }
}
export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) { super(message); this.name = "UnauthorizedError"; }
}
export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string) { super(message); this.name = "ForbiddenError"; }
}
```

Never throw plain `new Error()` in service files. Always use a typed error class so the
global handler can return the correct HTTP status.

---

### 6.8 File upload pattern

All files go to Cloudflare R2. Never store files locally or in the database.

```typescript
// apps/api/src/lib/storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Generate presigned upload URL — client uploads directly to R2
export async function getUploadUrl(key: string, contentType: string) {
  return getSignedUrl(r2, new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: contentType,
  }), { expiresIn: 300 });
}
```

File key convention: `{module}/{entityId}/{timestamp}-{filename}`
Examples:
- `transparency/post-uuid/1720000000-balanco-jan-2025.pdf`
- `partners/proof-uuid/1720000000-placa-foto.jpg`

---

### 6.9 QR code / membership card pattern

Membership card QR codes are signed JWTs verified offline. The private key signs; the public
key (embedded in the validator PWA) verifies. No network call required at validation time.

```typescript
// apps/api/src/lib/qr.ts
import { SignJWT, importPKCS8, jwtVerify, importSPKI } from "jose";

export async function generateCardToken(payload: {
  memberId: string;
  planId: string;
  tier: string;
  validUntil: string; // ISO date
  status: "ACTIVE";
}): Promise<string> {
  const privateKey = await importPKCS8(process.env.QR_PRIVATE_KEY!, "ES256");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setExpirationTime(payload.validUntil)
    .sign(privateKey);
}

// Verification used in validator PWA — public key only
export async function verifyCardToken(token: string) {
  const publicKey = await importSPKI(process.env.QR_PUBLIC_KEY!, "ES256");
  return jwtVerify(token, publicKey);
}
```

A new QR token must be generated in these exact situations (see RN-S08 in spec.md):
- Member activates a new plan
- Member upgrades or downgrades plan
- Member reactivates after suspension

Regenerate by invalidating the previous `MembershipCard` record and creating a new one.

---

### 6.10 PDF generation pattern

Use `@react-pdf/renderer` for all PDF output. Define templates in `apps/api/src/pdf/`.

```typescript
// apps/api/src/pdf/delivery-proof.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export function DeliveryProofDocument({ deal, proofs }: Props) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* template */}
      </Page>
    </Document>
  );
}

// In route handler:
import { renderToBuffer } from "@react-pdf/renderer";

const buffer = await renderToBuffer(<DeliveryProofDocument deal={deal} proofs={proofs} />);
reply.header("Content-Type", "application/pdf");
reply.send(buffer);
```

---

## 7. Module Dependency Rules

These rules prevent circular dependencies and keep modules isolated.

```
packages/schemas   ← imported by: web, api
packages/db        ← imported by: api only
packages/ui        ← imported by: web only

api modules:
  webhooks         → may enqueue jobs, may NOT call other module services directly
  members          → owns Subscription, MembershipCard, GamificationEvent, Poll, MatchEvent
  transparency     → owns TransparencyPost, DebtRecord, DebtSnapshot
  partners         → owns Partner, SponsorshipDeal, Deliverable, DeliveryProof
  store            → owns Product, Order
  auth             → owns Member auth — consumed by all modules via plugin

Cross-module communication: via BullMQ jobs or Prisma queries only.
Example: when a payment is confirmed, the payment job calls members.service,
not the other way around.
```

---

## 8. Naming Conventions

### Files
```
members.routes.ts       ← Fastify route plugin
members.service.ts      ← business logic
members.schema.ts       ← module-specific Zod extensions (if any)
members.test.ts         ← Vitest tests
```

### Database (Prisma)
- Models: `PascalCase` singular (`Member`, `SponsorshipDeal`)
- Fields: `camelCase` (`createdAt`, `validUntil`)
- Enums: `SCREAMING_SNAKE_CASE` values (`ACTIVE`, `IN_NEGOTIATION`)
- Relations: explicit `@relation` names on both sides

### API routes
```
GET    /members           → list
GET    /members/:id       → get one
POST   /members           → create
PATCH  /members/:id       → partial update
DELETE /members/:id       → soft delete (set isActive: false — never hard delete)
```

### TypeScript
```typescript
// Types from Zod inference — always infer, never duplicate
type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

// Async functions always return explicit types
async function createMember(input: CreateMemberInput, db: PrismaClient): Promise<Member>

// Boolean variables: is/has/can prefix
const isEligibleToVote = ...
const hasActiveSubscription = ...
const canAccessStore = ...
```

### Frontend components
```
MemberCard.tsx          ← PascalCase, one component per file
useMemberStatus.ts      ← hooks: use prefix
member-card.module.css  ← CSS modules if needed: kebab-case
```

---

## 9. Hard Rules — NEVER Do These

These are non-negotiable. Do not "improve" or work around them.

### Data integrity

```
NEVER hard-delete a TransparencyPost.
  → Set isArchived: true, or create a new version with supersededById pointing to the old one.
  → Reason: audit trail for creditors and press. Deletions undermine legal credibility.

NEVER hard-delete a SponsorshipDeal or DeliveryProof.
  → Set status: CANCELLED with a reason. Keep history.
  → Reason: partner relations and internal accountability.

NEVER decrement DebtSnapshot data.
  → Snapshots are append-only. Create a new snapshot; never update a past one.
  → Reason: the timeline graph in the transparency portal depends on immutable historical data.

NEVER let stock go below 0 for ESTOQUE_FIXO products.
  → Use a SELECT FOR UPDATE or Prisma transaction with optimistic concurrency.
  → Reason: race condition on simultaneous checkout of last item.
```

### Payments and security

```
NEVER store card numbers, CVVs, or raw payment credentials.
  → Payment data is tokenized by Mercado Pago. Store only gateway IDs and status.

NEVER update payment status or subscription status directly from an admin action.
  → Status updates flow exclusively through Mercado Pago webhooks.
  → If an admin needs to manually correct a status, this requires developer intervention
    with a documented reason in the audit log — not a UI button.

NEVER skip signature verification on incoming webhooks.
  → Every webhook from Mercado Pago must have its signature verified before processing.
  → See docs/webhooks/ for the exact verification algorithm.

NEVER expose internal IDs in webhook responses.
  → Respond 200 with an empty body. Do not confirm which record was updated.
```

### Auth and access

```
NEVER grant voting rights without verifying 12 consecutive months of adimplência.
  → The counter resets on ANY delinquency event — it does not pause.
  → See RN-S07 in spec.md.

NEVER allow a SUSPENDED member to purchase from the store or access member-only content.
  → Check subscription status, not just the membership card existence.

NEVER allow a guest to purchase a membersOnly product without redirecting to signup.
```

### Architecture

```
NEVER instantiate PrismaClient outside packages/db/index.ts.

NEVER define Zod schemas inline in route handlers or components.
  → All schemas go in packages/schemas.

NEVER process Mercado Pago webhooks synchronously.
  → Always enqueue to BullMQ first, respond 200, process async.

NEVER use Puppeteer or any headless browser for PDF generation.
  → Use @react-pdf/renderer exclusively.

NEVER write migrations by hand.
  → Use `pnpm db:migrate` (Prisma) to auto-generate from schema changes.

NEVER commit .env files.
  → Only .env.example is committed. Real values go in .env.local (gitignored).
```

### Compliance (LGPD)

```
NEVER log CPF, full name, or payment data in plaintext.
  → Mask in logs: CPF → "***.***.***-XX", card → last 4 digits only.

NEVER collect marketing communications without an explicit opt-in field (marketingConsent, whatsappOptIn) separate from transactional consent.

NEVER send CPF or sensitive PII in query parameters (URL).
  → Always in request body (POST/PATCH) or authenticated session.

NEVER delete a member record on account cancellation.
  → Anonymize: replace name with "Sócio Removido", email with a hash, phone with null.
  → Keep payment records for 5 years (fiscal obligation).
```

---

## 10. Environment Variables

All required variables must exist in `.env.example` with a description comment.
If you add a new integration or feature that requires an env var, add it to `.env.example` first.

```bash
# Database
DATABASE_URL="postgresql://tubarao:password@pgbouncer:5432/tubarao"
DIRECT_URL="postgresql://tubarao:password@postgres:5432/tubarao"
# DIRECT_URL is used by Prisma migrate (bypasses pgbouncer — required)

# Redis
REDIS_HOST="redis"
REDIS_PORT="6379"

# Better Auth
BETTER_AUTH_SECRET=""           # 32+ char random string
BETTER_AUTH_URL="https://api.tubarao.fc"

# Mercado Pago
MP_ACCESS_TOKEN=""              # production access token
MP_WEBHOOK_SECRET=""            # for signature verification
MP_PUBLIC_KEY=""                # frontend (non-secret)

# Cloudflare R2
R2_ENDPOINT="https://<account>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="tubarao-assets"
R2_PUBLIC_URL="https://assets.tubarao.fc"  # public CDN URL

# QR / JWT signing (ES256 key pair)
QR_PRIVATE_KEY=""               # PKCS8 PEM — api only, never exposed to frontend
QR_PUBLIC_KEY=""                # SPKI PEM — safe to embed in validator PWA

# Resend
RESEND_API_KEY=""
RESEND_FROM="noreply@tubarao.fc"

# Sentry
SENTRY_DSN=""                   # same value for web and api in MVP

# App URLs
NEXT_PUBLIC_APP_URL="https://tubarao.fc"
NEXT_PUBLIC_API_URL="https://api.tubarao.fc"
NEXT_PUBLIC_MP_PUBLIC_KEY=""    # Mercado Pago public key for frontend SDK
```

---

## 11. Testing

### Test file location
Colocate tests next to the file they test:
```
members.service.ts
members.service.test.ts   ← same folder
```

### What to test
- Every service function that contains business logic
- Every webhook handler (mock the queue)
- Every route that has auth or role requirements
- All Hard Rules from section 9 must have at least one test asserting the rule holds

### Test structure

```typescript
// members.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createMember } from "./members.service";
import { prismaMock } from "../../test/prisma-mock";

describe("createMember", () => {
  it("throws ConflictError when CPF is already registered", async () => {
    prismaMock.member.findUnique.mockResolvedValue({ id: "existing" } as any);

    await expect(
      createMember({ cpf: "12345678900", ...validInput }, prismaMock)
    ).rejects.toThrow(ConflictError);
  });

  it("throws ValidationError for invalid CPF", async () => {
    await expect(
      createMember({ cpf: "00000000000", ...validInput }, prismaMock)
    ).rejects.toThrow(ValidationError);
  });
});
```

### Running tests before committing
```bash
pnpm test        # must pass with no failures
pnpm typecheck   # must pass with no errors
pnpm lint        # must pass with no errors
```

If any of the three fail, do not ask the developer to approve — fix first.

---

## 12. Spec Compliance Checklist

Before marking any task complete, verify:

- [ ] The implementation matches the relevant `RF-XXX` requirements in `spec.md`
- [ ] Business rules `RN-XXX` are enforced in the service layer (not just the route)
- [ ] The acceptance criteria for the module (section 9 of spec.md) are satisfied
- [ ] No Hard Rule from section 9 of this file is violated
- [ ] A test exists that would catch regression of the main business rule
- [ ] New env vars are added to `.env.example`
- [ ] New Zod schemas are in `packages/schemas`, not inline
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass

---

## 13. Common Tasks (Cookbook)

### Add a new API endpoint
1. Add/update Zod schema in `packages/schemas/src/{module}.ts`
2. Run `pnpm --filter @repo/schemas build` to verify types
3. Add handler in `apps/api/src/modules/{module}/{module}.service.ts`
4. Register route in `apps/api/src/modules/{module}/{module}.routes.ts`
5. Write test in `{module}.service.test.ts`
6. Verify OpenAPI is auto-generated correctly via Fastify Swagger at `/docs`

### Add a new database field
1. Edit `packages/db/prisma/schema.prisma`
2. Run `pnpm db:migrate` — enter a descriptive migration name
3. Run `pnpm db:generate` — regenerates Prisma client
4. TypeScript errors in the codebase now show you what needs updating — fix them all

### Add a new background job
1. Create `apps/api/src/jobs/{job-name}.ts` with the processor function
2. Register the queue and worker in `apps/api/src/plugins/queues.ts`
3. Export the queue from the plugin so route handlers can enqueue via `fastify.queues.{name}`
4. Add retry and backoff config to the worker (default: 3 retries, exponential backoff)

### Add a new email template
1. Create `apps/api/src/emails/{TemplateName}.tsx` using React Email components
2. Add a send function in `apps/api/src/lib/email.ts`
3. Call the send function from a BullMQ job processor — never directly from a route handler

### Add a new environment variable
1. Add to `.env.example` with a comment explaining what it is and where to get it
2. Add to `.env.local` with the real value
3. Access via `process.env.VAR_NAME` — validate at startup using Zod env schema in
   `apps/api/src/lib/env.ts` and `apps/web/lib/env.ts`

---

*Last updated: 2026-06. Review and update this file whenever the stack, conventions, or
hard rules change. An outdated AGENTS.md is worse than no AGENTS.md.*
