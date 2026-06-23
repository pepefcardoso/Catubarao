# BACKLOG.md

Task backlog from zero to production. Each task is sized for a single AI agent session (~2–4h of implementation).

**Source of truth:** `spec.md` for business rules, `AGENTS.md` for conventions.  
**Rule:** a task is only "done" when every acceptance criterion is checked and `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass.

---

## Summary Table

| ID          | Title                                           | Phase | Size | Depends on                                   |
| ----------- | ----------------------------------------------- | ----- | ---- | -------------------------------------------- |
| FOUND-001   | Initialize Turborepo monorepo                   | 0     | S    | —                                            |
| FOUND-002   | Next.js 15 app bootstrap                        | 0     | S    | FOUND-001                                    |
| FOUND-003   | Fastify 5 app bootstrap                         | 0     | S    | FOUND-001                                    |
| FOUND-004   | Shared packages (schemas, db, ui, config)       | 0     | S    | FOUND-001                                    |
| FOUND-005   | Docker Compose infrastructure                   | 0     | S    | FOUND-001                                    |
| FOUND-006   | Prisma setup + env validation                   | 0     | S    | FOUND-004, FOUND-005                         |
| FOUND-007   | Better Auth configuration                       | 0     | M    | FOUND-003, FOUND-006                         |
| FOUND-008   | Fastify plugins (auth, redis, swagger, errors)  | 0     | M    | FOUND-003, FOUND-007                         |
| FOUND-009   | BullMQ plugin + queue definitions               | 0     | S    | FOUND-008                                    |
| FOUND-010   | GitHub Actions CI pipeline                      | 0     | S    | FOUND-001                                    |
| FOUND-011   | Caddy reverse proxy config                      | 0     | S    | FOUND-002, FOUND-003                         |
| FOUND-012   | Sentry setup (web + api)                        | 0     | S    | FOUND-002, FOUND-003                         |
| FOUND-013   | Tailwind CSS + shadcn/ui setup                  | 0     | S    | FOUND-002                                    |
| FOUND-014   | React Email + Resend setup                      | 0     | S    | FOUND-003                                    |
| FOUND-015   | Cloudflare R2 storage utility                   | 0     | S    | FOUND-003                                    |
| FOUND-016   | Layout shell — `(public)`                       | 0     | S    | FOUND-013                                    |
| FOUND-017   | Layout shell — `(member)`                       | 0     | S    | FOUND-013                                    |
| FOUND-018   | Layout shell — `(admin)`                        | 0     | S    | FOUND-013                                    |
| FOUND-019   | Layout shell — `(store)`                        | 0     | S    | FOUND-013                                    |
| MEMBER-001  | Prisma schema — member module                   | 1     | M    | FOUND-006                                    |
| MEMBER-002  | Zod schemas — member module                     | 1     | M    | FOUND-004                                    |
| MEMBER-003  | Auth routes (register, login, logout, refresh)  | 1     | M    | FOUND-007, FOUND-008, MEMBER-001, MEMBER-002 |
| MEMBER-004  | Member profile routes (GET /me, PATCH /me)      | 1     | S    | MEMBER-003                                   |
| MEMBER-005  | MembershipPlan CRUD (admin)                     | 1     | S    | MEMBER-003                                   |
| MEMBER-006  | Subscription creation + Mercado Pago checkout   | 1     | L    | MEMBER-005                                   |
| MEMBER-007  | Mercado Pago webhook handler + BullMQ job       | 1     | M    | FOUND-009, MEMBER-006                        |
| MEMBER-008  | Subscription status management service          | 1     | M    | MEMBER-007                                   |
| MEMBER-009  | Delinquency flow (scheduled jobs D+1/7/15/30)   | 1     | M    | MEMBER-008, FOUND-014                        |
| MEMBER-010  | Membership card + QR JWT generation             | 1     | M    | MEMBER-008                                   |
| MEMBER-011  | Gamification events service                     | 1     | M    | MEMBER-008                                   |
| MEMBER-012  | Poll and voting system                          | 1     | M    | MEMBER-003                                   |
| MEMBER-013  | Referral system                                 | 1     | S    | MEMBER-006                                   |
| MEMBER-014  | Email templates (all member lifecycle events)   | 1     | M    | FOUND-014, MEMBER-001                        |
| MEMBER-015  | Public goals dashboard data endpoint            | 1     | S    | MEMBER-001                                   |
| MEMBER-016  | Frontend — signup flow                          | 1     | M    | FOUND-013, FOUND-016, MEMBER-003             |
| MEMBER-017  | Frontend — plan selection page                  | 1     | S    | MEMBER-016, MEMBER-005                       |
| MEMBER-018  | Frontend — checkout (Mercado Pago Brick)        | 1     | M    | MEMBER-017, MEMBER-006                       |
| MEMBER-019  | Frontend — member dashboard                     | 1     | M    | MEMBER-016, MEMBER-010, FOUND-017            |
| MEMBER-020  | Frontend — membership card display + QR         | 1     | S    | MEMBER-010, MEMBER-019                       |
| MEMBER-021  | Frontend — payment history                      | 1     | S    | MEMBER-019                                   |
| MEMBER-022  | Frontend — public goals counter                 | 1     | S    | FOUND-013, MEMBER-015                        |
| MEMBER-023  | Frontend — admin members list + search          | 1     | M    | FOUND-013, FOUND-018, MEMBER-003             |
| MEMBER-024  | Frontend — admin member detail + actions        | 1     | M    | MEMBER-023                                   |
| MEMBER-025  | Frontend — admin plan management                | 1     | S    | MEMBER-005, FOUND-013                        |
| MEMBER-026  | Monthly streak increment job                    | 1     | S    | MEMBER-008, MEMBER-011                       |
| MEMBER-027  | Offline PWA / Service Worker for check-in       | 1     | M    | MEMBER-010, MEMBER-011                       |
| MEMBER-028  | MatchEvent CRUD API (admin stub)                | 1     | S    | MEMBER-003                                   |
| TRANS-001   | Prisma schema — transparency module             | 2     | S    | FOUND-006                                    |
| TRANS-002   | Zod schemas — transparency module               | 2     | S    | FOUND-004                                    |
| TRANS-003   | TransparencyPost CRUD API                       | 2     | M    | FOUND-008, TRANS-001, TRANS-002              |
| TRANS-004   | DebtRecord + DebtSnapshot API                   | 2     | M    | FOUND-008, TRANS-001, TRANS-002              |
| TRANS-005   | Monthly debt snapshot scheduled job             | 2     | S    | FOUND-009, TRANS-004                         |
| TRANS-006   | RSS feed endpoint                               | 2     | S    | TRANS-003                                    |
| TRANS-007   | Scheduled publishing BullMQ job                 | 2     | S    | FOUND-009, TRANS-003                         |
| TRANS-008   | Frontend — transparency portal homepage         | 2     | M    | FOUND-013, TRANS-003, TRANS-004              |
| TRANS-009   | Frontend — post list + category filter          | 2     | S    | TRANS-008                                    |
| TRANS-010   | Frontend — post detail (markdown render)        | 2     | S    | TRANS-009                                    |
| TRANS-011   | Frontend — debt dashboard (cards + chart)       | 2     | M    | TRANS-008                                    |
| TRANS-012   | Frontend — document repository + search         | 2     | S    | FOUND-015, TRANS-008                         |
| TRANS-013   | Frontend — admin transparency panel             | 2     | M    | MEMBER-023, TRANS-003                        |
| TRANS-014   | Frontend — admin debt records management        | 2     | M    | TRANS-013, TRANS-004                         |
| TRANS-015   | SEO metadata + XML sitemap                      | 2     | S    | TRANS-008, TRANS-010                         |
| PARTNER-001 | Prisma schema — partners module                 | 3     | S    | FOUND-006                                    |
| PARTNER-002 | Zod schemas — partners module                   | 3     | S    | FOUND-004                                    |
| PARTNER-003 | Partner CRUD API                                | 3     | S    | FOUND-008, PARTNER-001, PARTNER-002          |
| PARTNER-004 | SponsorshipDeal CRUD API                        | 3     | M    | PARTNER-003                                  |
| PARTNER-005 | Deliverable management API                      | 3     | M    | PARTNER-004                                  |
| PARTNER-006 | DeliveryProof upload (R2 presigned URL)         | 3     | M    | FOUND-015, PARTNER-005                       |
| PARTNER-007 | PDF delivery proof report generation            | 3     | M    | PARTNER-006                                  |
| PARTNER-008 | Deal expiration alert jobs (D-30/15/7)          | 3     | S    | FOUND-009, FOUND-014, PARTNER-004            |
| PARTNER-009 | Frontend — admin partner list                   | 3     | S    | FOUND-013, PARTNER-003                       |
| PARTNER-010 | Frontend — admin deal management                | 3     | M    | PARTNER-009, PARTNER-004                     |
| PARTNER-011 | Frontend — admin deliverable tracker            | 3     | M    | PARTNER-010, PARTNER-005                     |
| PARTNER-012 | Frontend — proof upload + PDF export            | 3     | M    | PARTNER-011, PARTNER-006, PARTNER-007        |
| STORE-001   | Prisma schema — store module                    | 4     | S    | FOUND-006                                    |
| STORE-002   | Zod schemas — store module                      | 4     | S    | FOUND-004                                    |
| STORE-003   | Product CRUD API (admin)                        | 4     | M    | FOUND-008, STORE-001, STORE-002              |
| STORE-004   | Stock management service                        | 4     | M    | STORE-003                                    |
| STORE-005   | Order creation + Mercado Pago one-time checkout | 4     | L    | STORE-004, MEMBER-007                        |
| STORE-006   | Order webhook handler + fulfillment flow        | 4     | M    | STORE-005                                    |
| STORE-007   | Frontend — product catalog                      | 4     | M    | FOUND-013, FOUND-019, STORE-003              |
| STORE-008   | Frontend — product detail page                  | 4     | S    | STORE-007                                    |
| STORE-009   | Frontend — checkout flow                        | 4     | M    | STORE-008, STORE-005                         |
| STORE-010   | Frontend — order confirmation + history         | 4     | S    | STORE-009                                    |
| STORE-011   | Frontend — admin product management             | 4     | M    | FOUND-013, STORE-003                         |
| STORE-012   | Frontend — admin order management               | 4     | M    | STORE-006, STORE-011                         |
| PROD-001    | Rate limiting on all public endpoints           | 5     | S    | FOUND-008                                    |
| PROD-002    | Security headers (CSP, HSTS, CORS)              | 5     | S    | FOUND-002, FOUND-003                         |
| PROD-003    | LGPD compliance (anonymization, data export)    | 5     | M    | MEMBER-001, MEMBER-003                       |
| PROD-004    | Cookie consent banner                           | 5     | S    | FOUND-013                                    |
| PROD-005    | Database backup strategy + restore test         | 5     | S    | FOUND-005                                    |
| PROD-006    | VPS hardening (firewall, SSH, fail2ban)         | 5     | S    | FOUND-011                                    |
| PROD-007    | Staging environment + deploy pipeline           | 5     | M    | FOUND-010                                    |
| PROD-008    | Load test — matchday simulation                 | 5     | M    | All modules                                  |
| PROD-009    | Monitoring + alerting (Sentry + uptime)         | 5     | S    | FOUND-012                                    |
| PROD-010    | Production deployment runbook                   | 5     | S    | All PROD tasks                               |

---

## Phase 0 — Foundation

---

### FOUND-001 — Initialize Turborepo monorepo

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** —

**Objective:** Bootstrap the repository structure defined in AGENTS.md §2 with Turborepo + pnpm workspaces.

**In scope:**

- `turbo.json` with pipelines: `dev`, `build`, `test`, `lint`, `typecheck`
- `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
- Root `package.json` with scripts delegating to turbo
- Empty placeholder `package.json` in each workspace: `apps/web`, `apps/api`, `packages/db`, `packages/schemas`, `packages/ui`, `packages/config`
- `packages/config/tsconfig/base.json`, `node.json`, `nextjs.json`
- `packages/config/eslint/base.js`
- Root `.gitignore`, `.prettierrc`, `.editorconfig`
- `docs/`, `docs/adr/`, `docs/acceptance/`, `docs/webhooks/` empty folders with `.gitkeep`

**Out of scope:** Any app code, Docker, env files.

**Acceptance criteria:**

- [x] `pnpm install` succeeds from root
- [x] `pnpm build` runs across all packages without error (empty output is fine)
- [x] `pnpm lint` and `pnpm typecheck` run without error
- [x] Folder structure matches AGENTS.md §2 exactly

---

### FOUND-002 — Next.js 15 app bootstrap

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-001

**Objective:** Initialize the Next.js 15 app with App Router, TypeScript, and the route group structure for the four audience areas.

**In scope:**

- Next.js 15 with App Router, TypeScript strict, Turbopack for dev
- Route groups: `(public)`, `(member)`, `(admin)`, `(store)` — each with a placeholder `page.tsx`
- `apps/web/lib/` folder with placeholder `api.ts` (fetch wrapper, typed, no implementation yet)
- `next.config.ts` pointing to `@repo/config/tsconfig/nextjs.json`
- Health check route: `GET /api/health` → `{ status: "ok" }`

**Out of scope:** Tailwind, shadcn, auth — those are FOUND-013 and FOUND-007.

**Acceptance criteria:**

- [x] `pnpm --filter web dev` starts without errors
- [x] `pnpm --filter web build` produces a valid build
- [x] `GET /api/health` returns `200 { status: "ok" }`
- [x] All four route groups exist with placeholder pages

---

### FOUND-003 — Fastify 5 app bootstrap

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-001

**Objective:** Initialize the Fastify 5 API with TypeScript, Pino logging, Zod type provider, and Swagger UI.

**In scope:**

- Fastify 5 with `fastify-type-provider-zod`
- Pino logger with pretty-print in dev, JSON in production
- `@fastify/swagger` + `@fastify/swagger-ui` — docs at `/docs`
- `@fastify/cors` configured for `NEXT_PUBLIC_APP_URL`
- Health check: `GET /health` → `{ status: "ok", timestamp: ISO }`
- Module folder structure: `src/modules/members`, `transparency`, `partners`, `store`, `webhooks` — each empty
- `src/lib/errors.ts` with all error classes from AGENTS.md §6.7
- Global error handler mapping custom errors to correct HTTP status codes
- `apps/api/tsconfig.json` extending `@repo/config/tsconfig/node.json`

**Out of scope:** Auth, Redis, BullMQ, database — separate tasks.

**Acceptance criteria:**

- [x] `pnpm --filter api dev` starts without errors
- [x] `GET /health` returns `200`
- [x] Swagger UI is accessible at `/docs`
- [x] An unhandled `ConflictError` thrown in a test handler returns `409`
- [x] `pnpm --filter api typecheck` passes

---

### FOUND-004 — Shared packages (schemas, db, ui, config)

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-001

**Objective:** Make all shared packages importable as `@repo/schemas`, `@repo/db`, `@repo/ui`, `@repo/config`.

**In scope:**

- `packages/schemas/src/index.ts` — empty barrel export
- `packages/schemas/package.json` with name `@repo/schemas`, exports map, build script (tsup)
- `packages/db/src/index.ts` — exports `prisma` singleton placeholder (`null` for now — real setup in FOUND-006)
- `packages/db/package.json` with name `@repo/db`
- `packages/ui/src/index.ts` — empty barrel
- `packages/ui/package.json` with name `@repo/ui`
- Verify `@repo/schemas` can be imported in `apps/api` and `apps/web` with correct types

**Out of scope:** Actual schema or component content — placeholder structure only.

**Acceptance criteria:**

- [x] `import { } from "@repo/schemas"` resolves without error in both apps
- [x] `import { prisma } from "@repo/db"` resolves without error in `apps/api`
- [x] `pnpm typecheck` passes across all workspaces

---

### FOUND-005 — Docker Compose infrastructure

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-001

**Objective:** Runnable local infrastructure with PostgreSQL 16, PgBouncer, and Redis 7.

**In scope:**

- `docker-compose.yml` with services: `postgres`, `pgbouncer`, `redis` (exact config from AGENTS.md §3)
- `docker-compose.override.yml` (gitignored) template for local port exposure
- `pgbouncer/pgbouncer.ini` and `pgbouncer/userlist.txt` config files
- `.env.example` with all infrastructure variables (see AGENTS.md §10)
- `Makefile` with shortcuts: `make up`, `make down`, `make logs`, `make reset-db`

**Out of scope:** `web` and `api` services in Docker — those come in PROD-007.

**Acceptance criteria:**

- [x] `docker compose up postgres pgbouncer redis -d` starts all three services
- [x] PostgreSQL is reachable on `localhost:5432` (direct) and via PgBouncer on `localhost:6432`
- [x] Redis is reachable on `localhost:6379`
- [x] `make reset-db` drops and recreates the database without error

---

### FOUND-006 — Prisma setup + env validation

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-004, FOUND-005

**Objective:** Prisma connected to PostgreSQL via PgBouncer, with Zod-based env validation at startup for both apps.

**In scope:**

- `packages/db/prisma/schema.prisma` — datasource + generator only (no models yet)
- `DATABASE_URL` pointing to PgBouncer, `DIRECT_URL` pointing to PostgreSQL directly (for migrations)
- `packages/db/src/index.ts` — real `PrismaClient` singleton (from AGENTS.md §6.5)
- `apps/api/src/lib/env.ts` — Zod schema validating all required env vars at startup; process exits with clear error if any are missing
- `apps/web/lib/env.ts` — same for Next.js (client-side vars prefixed `NEXT_PUBLIC_`)
- `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:studio`, `pnpm db:seed`, `pnpm db:reset` scripts wired up at root

**Out of scope:** Any Prisma models — those are defined per module.

**Acceptance criteria:**

- [x] `pnpm db:migrate` runs successfully against the local PostgreSQL
- [x] `pnpm db:generate` regenerates the client without error
- [x] Starting `apps/api` with a missing env var exits with a message listing exactly which variable is missing
- [x] `prisma.$connect()` succeeds via PgBouncer connection string

---

### FOUND-007 — Better Auth configuration

**Phase:** 0 · Foundation  
**Size:** M  
**Depends on:** FOUND-003, FOUND-006

**Objective:** Better Auth configured with email/password, Prisma adapter, JWT sessions, and role-based access (MEMBER, ADMIN).

**In scope:**

- Better Auth installed in `apps/api` with Prisma adapter pointing to `@repo/db`
- Auth schema additions to `packages/db/prisma/schema.prisma` (Better Auth generates these — run `bunx @better-auth/cli generate` and commit the output)
- Migration for auth tables
- `apps/api/src/plugins/auth.ts` — Fastify plugin exposing `fastify.authenticate` and `fastify.requireRole(role)` preHandlers
- `apps/web/lib/auth-client.ts` — Better Auth client with `useSession` hook
- Auth routes mounted at `/api/auth/*` in the API
- Next.js middleware protecting `(member)` and `(admin)` route groups

**Out of scope:** OAuth providers (Google etc.) — not required in MVP.

**Acceptance criteria:**

- [x] `POST /api/auth/sign-up` creates a member and returns a session
- [x] `POST /api/auth/sign-in` returns a valid session token
- [x] A route with `preHandler: [fastify.authenticate]` returns `401` without a valid token
- [x] A route with `fastify.requireRole("ADMIN")` returns `403` for a MEMBER role token
- [x] `useSession()` returns the correct user in a Next.js component

---

### FOUND-008 — Fastify plugins (redis, swagger, global error handler)

**Phase:** 0 · Foundation  
**Size:** M  
**Depends on:** FOUND-003, FOUND-007

**Objective:** All Fastify infrastructure plugins registered and working: Redis client, Swagger schema collection, and global error handler.

**In scope:**

- `apps/api/src/plugins/redis.ts` — `ioredis` client decorated as `fastify.redis`; connection verified at startup
- `apps/api/src/plugins/swagger.ts` — `@fastify/swagger` configured with `zod-to-json-schema`; auto-collects schemas from routes; Swagger UI at `/docs`
- Global error handler in `apps/api/src/server.ts` mapping all custom error classes to correct HTTP responses with shape `{ error: string, message: string }`
- `@fastify/rate-limit` installed and registered (limits configured per-route — not global defaults yet; that is PROD-001)
- `@fastify/multipart` registered for future file uploads

**Out of scope:** BullMQ (FOUND-009), per-route rate limits (PROD-001).

**Acceptance criteria:**

- [x] `fastify.redis.ping()` returns `PONG` at startup
- [x] Swagger UI at `/docs` shows all registered routes
- [x] Throwing `new NotFoundError("x")` in any handler returns `{ error: "NotFoundError", message: "x" }` with status `404`
- [x] `pnpm --filter api typecheck` passes

---

### FOUND-009 — BullMQ plugin + queue definitions

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-008

**Objective:** BullMQ queues and workers registered as a Fastify plugin; all queue names declared upfront even if processors are empty stubs.

**In scope:**

- `apps/api/src/plugins/queues.ts` — declares queues: `payments`, `email`, `notifications`, `scheduled`
- Worker stubs for each queue (empty processors that log and ack)
- `fastify.queues.payments.add(...)` callable from route handlers
- Default job options: 3 retries, exponential backoff starting at 1000ms, removeOnComplete: 100, removeOnFail: 500
- Bull Board UI mounted at `/admin/queues` (protected by ADMIN role) for job inspection

**Out of scope:** Actual job processors — those are implemented per module.

**Acceptance criteria:**

- [x] All four queues connect to Redis without error at startup
- [x] A test job added to `email` queue is picked up by the worker and logged
- [x] Bull Board is accessible at `/admin/queues` with ADMIN token and returns `401` without one
- [x] Failed jobs (throwing an error) are retried 3 times before moving to failed state

---

### FOUND-010 — GitHub Actions CI pipeline

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-001

**Objective:** CI runs typecheck, lint, and test on every push and pull request to `main`.

**In scope:**

- `.github/workflows/ci.yml` — triggers on `push` and `pull_request` to `main`
- Steps: checkout → pnpm install (with cache) → `pnpm typecheck` → `pnpm lint` → `pnpm test` (with postgres + redis as service containers)
- `.github/workflows/deploy.yml` — triggers on push to `main`, builds Docker images and deploys to VPS via SSH (placeholder — real deploy config in PROD-007)
- `pnpm audit` step with `--audit-level=high` (fails CI on high-severity vulnerabilities)

**Acceptance criteria:**

- [x] CI passes on a clean push to `main`
- [x] CI fails if `pnpm typecheck` fails
- [x] CI fails if `pnpm lint` fails
- [x] CI fails if any test fails
- [x] pnpm cache is used between runs (install step < 30s on second run)

---

### FOUND-011 — Caddy reverse proxy config

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-002, FOUND-003

**Objective:** Caddy routes traffic to web and api, handles HTTPS automatically via ACME.

**In scope:**

- `Caddyfile` with two virtual hosts: `tubarao.fc → web:3000` and `api.tubarao.fc → api:3001`
- Automatic HTTPS (Caddy default behavior)
- HTTP → HTTPS redirect
- `caddy` service added to `docker-compose.yml` with volume mounting `Caddyfile`
- Local dev: `tubarao.localhost` and `api.tubarao.localhost` using Caddy's internal CA

**Acceptance criteria:**

- [x] `https://tubarao.localhost` serves Next.js app in local dev
- [x] `https://api.tubarao.localhost/health` returns `200`
- [x] HTTP requests are redirected to HTTPS
- [x] No browser certificate warning in local dev (Caddy CA trusted)

---

### FOUND-012 — Sentry setup (web + api)

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-002, FOUND-003

**Objective:** Sentry capturing unhandled errors in both Next.js and Fastify with source maps.

**In scope:**

- `@sentry/nextjs` in `apps/web` — `instrumentation.ts` and `sentry.*.config.ts` files
- `@sentry/node` in `apps/api` — initialized before Fastify server starts
- Source maps uploaded to Sentry on build
- `SENTRY_DSN` env var (same project for both in MVP)
- `SENTRY_ENVIRONMENT` set to `development` | `staging` | `production`
- Sentry user context set on authenticated requests (userId, email — no PII beyond that)

**Acceptance criteria:**

- [x] Manually throwing an error in a Next.js page is captured in Sentry
- [x] Manually throwing an error in a Fastify route is captured in Sentry
- [x] Source maps resolve to original TypeScript lines in Sentry

---

### FOUND-013 — Tailwind CSS + shadcn/ui setup

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-002

**Objective:** Tailwind 4 and shadcn/ui installed in `apps/web`, with `packages/ui` as the component library.

**In scope:**

- Tailwind 4 configured in `apps/web`
- shadcn/ui initialized with CSS variables theme, neutral base color
- Core components installed into `packages/ui/src/components`: `Button`, `Input`, `Card`, `Badge`, `Dialog`, `Sheet`, `Table`, `Form`, `Tabs`, `Skeleton`, `Avatar`, `Separator`
- `packages/ui` exports all components; `apps/web` imports from `@repo/ui`
- Global font: Inter (via `next/font`)
- Dark mode: class-based (not system default — admin will configure)

**Acceptance criteria:**

- [x] A test page renders a `Button` imported from `@repo/ui` without error
- [x] `pnpm --filter web build` passes with Tailwind compiled

---

### FOUND-014 — React Email + Resend setup

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-003

**Objective:** Email sending infrastructure in the API with React Email templates and Resend.

**In scope:**

- `resend` SDK installed in `apps/api`
- `react-email` + `@react-email/components` installed
- `apps/api/src/lib/email.ts` — typed `sendEmail(template, to, subject)` function wrapping Resend
- `apps/api/src/emails/` folder with one placeholder template: `WelcomeEmail.tsx`
- BullMQ job processor stub: `apps/api/src/jobs/send-email.ts` — receives `{ template, to, subject, props }`, instantiates and sends
- `pnpm --filter api email:preview` script to preview templates locally with React Email dev server

**Acceptance criteria:**

- [x] `sendEmail(WelcomeEmail, "test@test.com", "Welcome")` sends an email (verified in Resend dashboard)
- [x] Enqueuing a job to the `email` queue results in the email being sent
- [x] Email preview server starts at `localhost:3002`

---

### FOUND-015 — Cloudflare R2 storage utility

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-003

**Objective:** Typed utility for generating R2 presigned upload/download URLs and deleting objects.

**In scope:**

- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` installed in `apps/api`
- `apps/api/src/lib/storage.ts` with functions: `getUploadUrl(key, contentType, expiresIn?)`, `getDownloadUrl(key, expiresIn?)`, `deleteObject(key)`
- Key naming convention enforced via a `buildStorageKey(module, entityId, filename)` helper
- Vitest test mocking the S3 client and verifying key format

**Acceptance criteria:**

- [x] `getUploadUrl(...)` returns a URL containing the R2 endpoint and correct key
- [x] Key generated by `buildStorageKey("transparency", "uuid-123", "doc.pdf")` matches pattern `transparency/uuid-123/{timestamp}-doc.pdf`
- [x] `deleteObject` calls `DeleteObjectCommand` with correct bucket and key

---

### FOUND-016 — Layout shell — (public)

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-013

**Objective:** Implement the layout shell for the public facing routes.

**In scope:**

- Covers: header, nav/sidebar, footer, responsive behavior, empty slot for page content.
- Must be done before the first content task in this phase.

**Acceptance criteria:**

- [x] Responsive behavior is fully functional
- [x] Header, footer, and navigation are present

---

### FOUND-017 — Layout shell — (member)

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-013

**Objective:** Implement the layout shell for the member facing routes.

**In scope:**

- Covers: header, nav/sidebar, footer, responsive behavior, empty slot for page content.
- Must be done before the first content task in this phase.

**Acceptance criteria:**

- [x] Responsive behavior is fully functional
- [x] Header, footer, and navigation are present

---

### FOUND-018 — Layout shell — (admin)

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-013

**Objective:** Implement the layout shell for the admin facing routes.

**In scope:**

- Covers: header, nav/sidebar, footer, responsive behavior, empty slot for page content.
- Must be done before the first content task in this phase.

**Acceptance criteria:**

- [x] Responsive behavior is fully functional
- [x] Header, footer, and navigation are present

---

### FOUND-019 — Layout shell — (store)

**Phase:** 0 · Foundation  
**Size:** S  
**Depends on:** FOUND-013

**Objective:** Implement the layout shell for the store facing routes.

**In scope:**

- Covers: header, nav/sidebar, footer, responsive behavior, empty slot for page content.
- Must be done before the first content task in this phase.

**Acceptance criteria:**

- [x] Responsive behavior is fully functional
- [x] Header, footer, and navigation are present

---

## Phase 1 — Sócio-Torcedor

---

### MEMBER-001 — Prisma schema — member module

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-006

**Objective:** All Prisma models for the member module added to `schema.prisma` and migrated.

**In scope:**

- Models: `MembershipPlan`, `Subscription`, `Payment`, `MembershipCard`, `GamificationEvent`, `Poll`, `PollVote`
- All fields, types, relations, and constraints from the data model in spec.md §6
- Enum definitions: `SubscriptionStatus`, `PaymentStatus`, `PaymentMethod`, `GamificationEventType`, `PollStatus`
- Indexes: `Subscription(memberId, status)`, `Payment(subscriptionId)`, `MembershipCard(memberId, isActive)`, `PollVote` unique on `(pollId, memberId)`
- Migration named `add_member_module`
- `pnpm db:generate` run after migration

**Acceptance criteria:**

- [x] Migration applies cleanly to a fresh database
- [x] All models are introspectable via `pnpm db:studio`
- [x] `db.subscription.findMany({ where: { memberId: x, status: "ACTIVE" } })` is type-safe with no TypeScript errors

---

### MEMBER-002 — Zod schemas — member module

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-004

**Objective:** All Zod schemas for the member module in `packages/schemas/src/member.ts`.

**In scope:**

- `CreateMemberSchema`, `UpdateMemberSchema`, `MemberResponseSchema`
- `CreateMembershipPlanSchema`, `MembershipPlanResponseSchema`
- `CreateSubscriptionSchema`, `SubscriptionResponseSchema`
- `MembershipCardResponseSchema`
- `CreatePollSchema`, `PollResponseSchema`, `CastVoteSchema`
- `GamificationEventResponseSchema`
- CPF validation: 11 digits, no formatting, rejects obvious invalid patterns (000...0, 111...1)
- `CreateMemberSchema` includes `marketingConsent: z.boolean().default(false)` and `whatsappOptIn: z.boolean().default(false)`
- Phone validation: E.164 format or Brazilian format (normalise to E.164 on input)
- All schemas exported from `packages/schemas/src/index.ts`

**Acceptance criteria:**

- [x] `CreateMemberSchema.parse({ cpf: "00000000000" })` throws
- [x] `CreateMemberSchema.parse({ cpf: "invalid" })` throws
- [x] A valid input passes all schemas without error
- [x] Types inferred from schemas match the Prisma model field types (verify manually)

---

### MEMBER-003 — Auth routes (register, login, logout, refresh)

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-007, FOUND-008, MEMBER-001, MEMBER-002

**Objective:** Member registration and auth flow complete, with CPF uniqueness and input validation.

**In scope:**

- `POST /auth/register` — validates `CreateMemberSchema`, checks CPF uniqueness, creates `Member` via Better Auth, returns session
- `POST /auth/login` — email + password, returns session token
- `POST /auth/logout` — invalidates session
- `POST /auth/refresh` — issues new access token from refresh token
- CPF uniqueness check happens in service layer before Better Auth user creation
- Tests: duplicate CPF returns `409`, invalid CPF returns `422`, successful register returns `201` with session

**Acceptance criteria:**

- [x] `POST /auth/register` with duplicate CPF returns `409 ConflictError`
- [x] `POST /auth/register` with invalid CPF returns `422 ValidationError`
- [x] `POST /auth/register` with valid data creates the member and returns a usable session token
- [x] `POST /auth/login` with wrong password returns `401`
- [x] Access token expires after 15 minutes (configurable via env)

---

### MEMBER-004 — Member profile routes

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-003

**Objective:** Authenticated member can view and update their own profile.

**In scope:**

- `GET /members/me` — returns member profile + active subscription status + adimplência streak (months)
- `PATCH /members/me` — updates: `name`, `phone`, `address`, `showOnMonument` (opt-in flag)
- CPF and email cannot be changed via this endpoint (returns `403` if attempted)
- Test: PATCH with `cpf` in body returns `403`

**Acceptance criteria:**

- [x] `GET /members/me` returns adimplência streak calculated correctly
- [x] `PATCH /members/me` with `{ cpf: "..." }` returns `403`
- [x] `PATCH /members/me` with valid fields updates and returns updated profile
- [x] Both routes return `401` without authentication

---

### MEMBER-005 — MembershipPlan CRUD (admin)

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-003

**Objective:** Admin can create, update, activate/deactivate membership plans.

**In scope:**

- `GET /plans` — public, lists all active plans with benefits
- `POST /admin/plans` — ADMIN only
- `PATCH /admin/plans/:id` — ADMIN only
- `DELETE /admin/plans/:id` — sets `isActive: false` (never hard deletes); returns `409` if plan has active subscribers
- Plan fields: `name`, `price`, `interval` (MONTHLY | ANNUAL), `benefits` (string array), `isCorporate`, `maxCards`, `isActive`

**Acceptance criteria:**

- [x] `GET /plans` is accessible without auth and returns only active plans
- [x] `POST /admin/plans` without ADMIN token returns `403`
- [x] `DELETE /admin/plans/:id` with active subscribers returns `409`
- [x] Deactivated plan no longer appears in `GET /plans`

---

### MEMBER-006 — Subscription creation + Mercado Pago checkout

**Phase:** 1 · Sócio-Torcedor  
**Size:** L  
**Depends on:** MEMBER-005

**Objective:** Member can subscribe to a plan; system creates a Mercado Pago preapproval (recurrent subscription) and a pending local Subscription record.

**In scope:**

- `POST /subscriptions` — authenticated member selects a plan, system calls MP Preapproval API, returns `{ subscriptionId, checkoutUrl }` for the Mercado Pago payment flow
- `Subscription` created with `status: PENDING` immediately
- For corporate plans: validates `maxCards` and creates linked card slots
- Upgrade/downgrade: `PATCH /subscriptions/:id/plan` — cancels old MP preapproval, creates new one, updates local record
- Cancel: `DELETE /subscriptions/:id` — cancels MP preapproval, sets local status to `CANCELLED`
- Tests mock the MP SDK — do not make real API calls in tests

**Acceptance criteria:**

- [x] `POST /subscriptions` returns a Mercado Pago checkout URL
- [x] Local `Subscription` is created with `status: PENDING` before payment confirmation
- [x] A member with an existing `ACTIVE` subscription cannot create a second one (returns `409`)
- [x] Cancel sets status to `CANCELLED` and calls MP preapproval cancel
- [x] `DELETE /subscriptions/:id` on a corporate plan sets all linked `MembershipCard` records to `isActive: false` in the same transaction

---

### MEMBER-007 — Mercado Pago webhook handler + BullMQ job

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-009, MEMBER-006

**Objective:** Incoming Mercado Pago webhooks are signature-verified, enqueued, and processed asynchronously.

**In scope:**

- `POST /webhooks/mercadopago` — signature verification using `x-signature` and `x-request-id` headers (exact algorithm from `docs/webhooks/`)
- Responds `200` immediately after enqueuing; never processes synchronously
- BullMQ processor `apps/api/src/jobs/process-payment-event.ts` handles: `payment.approved` → calls `updateSubscriptionStatus`, `payment.rejected` / `payment.cancelled` → marks subscription pending
- All payment events persisted to `Payment` table regardless of outcome
- Add `gatewayPaymentId` uniqueness index to `Payment` table (migration note)
- Tests: invalid signature returns `401`; valid payload is enqueued (mock BullMQ)

**Acceptance criteria:**

- [x] Webhook with invalid signature returns `401` and does NOT enqueue
- [x] Valid webhook returns `200` within 50ms (enqueue is fast, no DB write in handler)
- [x] Response body for `POST /webhooks/mercadopago` is always empty on `200`
- [x] `payment.approved` event results in `Subscription.status = ACTIVE` and `Payment` record created
- [x] Failed job retries 3 times before moving to dead letter queue
- [x] Duplicate delivery of same `gatewayPaymentId` is a no-op (upsert or early-exit before enqueue)
- [x] `WelcomeEmail` job is only enqueued if no prior `Payment` with `status: APPROVED` exists for this member

---

### MEMBER-008 — Subscription status management service

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-007

**Objective:** Central service function for all subscription status transitions, enforcing all RN-S rules atomically.

**In scope:**

- `activateSubscription` split into two services:
  - `reactivateFromDelinquency(subscriptionId, db)` — sets `ACTIVE`, resets streak to 0, generates new card
  - `renewActiveSubscription(subscriptionId, db)` — leaves streak untouched, renews card
- `suspendSubscription(subscriptionId, db)` — sets `SUSPENDED`, invalidates current card
- `cancelSubscription(subscriptionId, db)` — sets `CANCELLED`, invalidates card, and cascades cancel to all linked cards
- All transitions wrapped in `db.$transaction`
- Adimplência streak stored on `Member` model (add field in migration): `adimplenciaStreakMonths: Int @default(0)`, `lastAdimplenciaResetAt: DateTime?`
- Streak incremented monthly by a scheduled job (MEMBER-009); reset to 0 on any suspension
- Voting eligibility computed from streak: `isEligibleToVote = adimplenciaStreakMonths >= 12`

**Acceptance criteria:**

- [x] Activating a suspended subscription resets streak to 0 (fresh start, not resumed)
- [x] Transaction rolls back entirely if card invalidation fails
- [x] `isEligibleToVote` returns false for a member with 11 months streak, true at 12

---

### MEMBER-009 — Delinquency flow (scheduled jobs)

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-008, FOUND-014

**Objective:** Automated delinquency notifications and suspension via BullMQ scheduled jobs.

**In scope:**

- Daily BullMQ repeatable job (cron: every day at 08:00 BRT) that:
  - Finds subscriptions with `status: PENDING` and calculates days since `currentPeriodEnd`
  - D+1: enqueues `send-email` job with `DelinquencyReminderEmail` (first notice)
  - D+7: enqueues second reminder email
  - D+15: enqueues final warning email
  - D+30: calls `suspendSubscription` + enqueues suspension email
- Idempotency: tracks which notification was already sent via a `SubscriptionNotification` table (id, subscriptionId, type, sentAt) to prevent duplicate sends across job runs
- Email templates: `DelinquencyD1Email`, `DelinquencyD7Email`, `DelinquencyD15Email`, `SuspensionEmail` in `apps/api/src/emails/`

**Acceptance criteria:**

- [x] A subscription at D+1 receives exactly one first-notice email (even if job runs twice)
- [x] A subscription at D+30 is suspended and card invalidated
- [x] Reactivated subscription (MEMBER-008) stops receiving delinquency notifications

---

### MEMBER-010 — Membership card + QR JWT generation

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-008

**Objective:** Membership card generation with signed QR JWT, verifiable offline.

**In scope:**

- `apps/api/src/lib/qr.ts` — `generateCardToken` and `verifyCardToken` from AGENTS.md §6.9
- `generateMembershipCard(memberId, subscriptionId, db)` service function:
  - Invalidates any existing active card for this subscription
  - Creates new `MembershipCard` record with JWT token valid until `subscription.currentPeriodEnd`
  - Returns card data including token
- `GET /members/me/card` — returns current active card; `404` if suspended
- `POST /members/:id/card/rotate` (ADMIN only) — force-regenerates card (for lost/stolen)
- ES256 key pair: private key in `QR_PRIVATE_KEY` env var, public key in `QR_PUBLIC_KEY` (both PEM format)
- Vitest test: generated token verifies correctly with public key

**Acceptance criteria:**

- [x] Generated JWT contains `{ memberId, planId, tier, validUntil, status: "ACTIVE" }`
- [x] Token verifies offline using only the public key
- [x] `GET /members/me/card` for a suspended member returns `404`
- [x] Rotating a card invalidates the previous card's `isActive` flag

---

### MEMBER-011 — Gamification events service

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-008, MEMBER-028

**Objective:** Point-earning events recorded per the rules in spec.md RF-S21–S23.

**In scope:**

- `recordGamificationEvent(memberId, type, metadata, db)` — creates `GamificationEvent`, prevents duplicates per idempotency key (e.g., one ANNIVERSARY per year per member)
- Event types and their point values are configured in `MembershipPlan` (add `gamificationRules: Json` field) or a separate config table — use config table for flexibility
- `GET /members/me/points` — returns total points and breakdown by type
- `GET /leaderboard?limit=20` — public endpoint, returns top members by points (only those who opted in via `showOnLeaderboard` preference)
- Check-in event triggered by the QR validator route: `POST /events/:eventId/checkin` (receives QR token, verifies it, records CHECKIN event)

**Acceptance criteria:**

- [x] Recording two ANNIVERSARY events for the same member in the same year creates only one
- [x] Leaderboard only includes members who opted in
- [x] Check-in with an invalid or expired QR token returns `401`
- [x] Check-in with a valid token records the event and returns updated points

---

### MEMBER-012 — Poll and voting system

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-003

**Objective:** Admin-created polls with eligibility enforcement and one-vote-per-member constraint.

**In scope:**

- `POST /admin/polls` — creates poll with options, open/close times, quorum, `requiresSeniority` flag
- `GET /polls` — public, lists open polls
- `GET /polls/:id` — returns poll with current vote counts (not individual votes — anonymous)
- `POST /polls/:id/vote` — authenticated member casts vote; returns `403` if `requiresSeniority` and member is not eligible; returns `409` if already voted
- Poll auto-closes at `closesAt` via BullMQ scheduled job; publishes result
- `GET /polls/:id/result` — available after close; shows option counts and whether quorum was reached

**Acceptance criteria:**

- [x] Voting twice on the same poll returns `409`
- [x] Voting on a `requiresSeniority` poll with 11 months streak returns `403`
- [x] Voting on a `requiresSeniority` poll with 12+ months streak succeeds
- [x] Poll results are visible after `closesAt` with correct counts

---

### MEMBER-013 — Referral system

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-006

**Objective:** Member gets a unique referral code; points credited only when the referred member completes first payment.

**In scope:**

- `referralCode` field on `Member` — generated on registration (8-char alphanumeric, unique)
- `GET /members/me/referral` — returns code and count of successful referrals
- Referral code accepted at registration (`POST /auth/register` body field: `referralCode`)
- `referredBy` FK set on the new member record
- When referred member's first `payment.approved` webhook fires, REFERRAL gamification event is recorded for the referrer
- Idempotency: referral points recorded only once per referred member

**Acceptance criteria:**

- [x] Registering with an invalid referral code returns `422`
- [x] Referral points are NOT credited when the referred member registers (only on first payment)
- [x] Referral points ARE credited once the referred member completes first payment
- [x] Second payment by same referred member does not credit the referrer again

---

### MEMBER-014 — Email templates (all member lifecycle events)

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-014, MEMBER-001

**Objective:** All member lifecycle email templates implemented and wired to their triggers.

**In scope (templates):**

- `WelcomeEmail` — sent on first successful payment; includes plan name, card download link
- `PaymentConfirmedEmail` — sent on each recurring payment success
- `DelinquencyD1Email`, `DelinquencyD7Email`, `DelinquencyD15Email` — escalating urgency
- `SuspensionEmail` — sent on D+30 suspension; includes reactivation link
- `ReactivationEmail` — sent when suspended member pays and is reactivated
- `PollOpenEmail` (optional, only for eligible voters) — sent when a new poll opens

All templates: club logo, responsive layout, unsubscribe footer (transactional emails are exempt from unsubscribe under LGPD, but include it anyway for trust).

**Acceptance criteria:**

- [x] All templates render without error in `pnpm email:preview`
- [x] All templates are mobile-responsive (test at 375px width)
- [x] `WelcomeEmail` is triggered exactly once per member (first payment only, not subsequent)

---

### MEMBER-015 — Public goals dashboard data endpoint

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-001

**Objective:** Public endpoint returning live member counts by tier for the goals dashboard.

**In scope:**

- `GET /stats/members` — no auth required; returns: `{ total: N, byTier: [{ planId, planName, count }], goals: [...] }`
- Goals configured by admin via: `POST /admin/goals` — `{ label: "500 sócios = salário sub-17", target: 500, metric: "total_active" }`
- Response cached in Redis for 30 seconds (invalidated by webhook that activates a subscription)
- Cache key: `stats:members`

**Acceptance criteria:**

- [x] Response is correct immediately after a new subscription is activated
- [x] Second call within 30s returns cached response (verify via Redis key existence)
- [x] Cache is invalidated when a subscription webhook fires

---

### MEMBER-016 — Frontend — signup flow

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-013, MEMBER-003

**Objective:** Multi-step signup form: personal data → email/password → success.

**In scope:**

- Route: `/(public)/signup`
- Step 1: name, CPF (masked input), phone, birthDate, referralCode (optional)
- Step 2: email, password, password confirmation
- Client-side validation using `CreateMemberSchema` via `react-hook-form` + `zodResolver`
- Error states: CPF taken → inline message; generic error → toast
- Success: redirects to plan selection (MEMBER-017)
- Loading states on submit button

**Acceptance criteria:**

- [x] Submitting with an invalid CPF shows inline error without API call
- [x] CPF input applies mask `###.###.###-##` on type
- [x] CPF mask is stripped to 11 raw digits before schema parse and API call
- [x] Signup form has explicit opt-in checkboxes for email marketing and WhatsApp, unchecked by default
- [x] Successful signup redirects to plan selection
- [x] Form is accessible (all fields have labels, errors announced to screen readers)

---

### MEMBER-017 — Frontend — plan selection page

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-016, MEMBER-005

**Objective:** Plan cards with benefits list and CTA to checkout.

**In scope:**

- Route: `/(member)/plans`
- Fetches `GET /plans`, renders one card per active plan
- Monthly/Annual toggle with automatic price adjustment display
- Corporate plan card: distinct styling, links to contact form (not direct checkout)
- Currently active plan highlighted (if member already has a subscription)
- CTA: "Assinar" → navigates to checkout with `planId` in URL

**Acceptance criteria:**

- [x] Monthly/annual toggle updates all prices simultaneously
- [x] Active plan is visually indicated
- [x] Corporate plan CTA links to contact, not checkout

---

### MEMBER-018 — Frontend — checkout (Mercado Pago Brick)

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-017, MEMBER-006

**Objective:** Checkout page embedding the Mercado Pago Payment Brick for card data entry.

**In scope:**

- Route: `/(member)/checkout?planId=xxx`
- Page calls `POST /subscriptions`, receives checkout URL
- For Pix: shows QR code and copy-paste code from MP response
- For card: embeds Mercado Pago Brick (`@mercadopago/sdk-react`)
- On payment success: Brick triggers callback → optimistic UI "aguardando confirmação" → polls `GET /subscriptions/:id` until status is `ACTIVE` (max 60s, 3s interval) → redirects to dashboard
- On failure: error message with retry option

**Acceptance criteria:**

- [x] MP Brick renders without console errors
- [x] Successful payment transitions to "aguardando confirmação" state
- [x] After webhook fires and subscription is ACTIVE, user is redirected to dashboard automatically
- [x] Pix code is copyable with one click

---

### MEMBER-019 — Frontend — member dashboard

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-016, MEMBER-010

**Objective:** Member's home page after login: subscription status, card preview, points summary, poll notifications.

**In scope:**

- Route: `/(member)/dashboard`
- Subscription status banner: ACTIVE (green), PENDING (yellow with payment link), SUSPENDED (red with regularization CTA)
- Card preview widget (visual card with QR — links to full card view)
- Points balance + recent events (last 5)
- Open polls widget (if member has any to vote on)
- Quick links: payment history, profile settings, referral code

**Acceptance criteria:**

- [x] Dashboard shows correct status for ACTIVE, PENDING, and SUSPENDED states (test with mocked API)
- [x] Suspended state shows regularization CTA, not the card widget
- [x] All sections render correctly on mobile (375px)

---

### MEMBER-020 — Frontend — membership card display + QR

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-010, MEMBER-019

**Objective:** Full-screen membership card with QR code for matchday use.

**In scope:**

- Route: `/(member)/card`
- Full-screen card design: club colors, member name, tier badge, member number, QR code, validity date
- QR code rendered from the JWT token using `qrcode.react`
- Brightness boosted on this page (CSS: `filter: brightness(1.2)` on body) to improve scanner reading
- "Keep screen on" via Wake Lock API (with graceful fallback)
- Suspended members see a disabled state card with "regularize sua situação" message

**Acceptance criteria:**

- [x] QR code is scannable by the validator (test with MEMBER-011 check-in endpoint)
- [x] Wake Lock is requested on page mount
- [x] Suspended member cannot see an active QR
- [x] QR code container has `bg-white p-4` applied unconditionally, regardless of system color scheme

---

### MEMBER-021 — Frontend — payment history

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-019

**Objective:** Member views their payment history with status and receipt links.

**In scope:**

- Route: `/(member)/payments`
- Table: date, amount, method (Pix / Cartão), status badge, "Ver recibo" link (to MP receipt URL)
- Pagination (10 per page)
- Empty state for new members

**Acceptance criteria:**

- [x] Failed payments appear with red status badge
- [x] Pagination works correctly
- [x] Table is scrollable horizontally on mobile

---

### MEMBER-022 — Frontend — public goals counter

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** FOUND-013, MEMBER-015

**Objective:** Public page showing live member counts and campaign goals.

**In scope:**

- Route: `/(public)/socios`
- Live counter (polls `GET /stats/members` every 30s)
- Progress bars per goal
- Total count prominently displayed
- "Seja sócio" CTA linking to signup
- Shareable meta tags (OG image with current count)

**Acceptance criteria:**

- [x] Counter updates within 35s of a new member activating (30s cache + 5s poll interval)
- [x] OG image meta tag is present and correct

---

### MEMBER-023 — Frontend — admin members list + search

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** FOUND-013, MEMBER-003

**Objective:** Admin table of all members with search, filter by status, and pagination.

**In scope:**

- Route: `/(admin)/members`
- Table columns: name, email, CPF (masked), plan, status badge, adimplência streak, join date, actions
- Search by name or email (debounced, 300ms)
- Filter by subscription status (ALL, ACTIVE, PENDING, SUSPENDED, CANCELLED)
- Pagination (20 per page)
- Export CSV button: downloads name, email, plan, status, join date (no CPF in export — LGPD)
- Click row → navigates to member detail (MEMBER-024)

**Acceptance criteria:**

- [x] Search filters results in real-time (debounced)
- [x] CSV export does not include CPF
- [x] Pagination maintains filter/search state
- [x] Table shows a skeleton loader while fetching data
- [x] Table shows a dedicated empty state component when no members are found

---

### MEMBER-024 — Frontend — admin member detail + actions

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-023

**Objective:** Admin view of individual member with full history and manual action triggers.

**In scope:**

- Route: `/(admin)/members/:id`
- Profile section: all fields, adimplência streak, voting eligibility badge
- Subscription section: current plan, status, period dates, MP subscription ID
- Payment history table
- Card section: current card status, "Rotar carteirinha" button (calls MEMBER-010 rotate endpoint)
- Gamification points table
- Actions: cannot manually change subscription status (see AGENTS.md Hard Rules)
- Admin note field: free-text note saved per member (add `adminNotes: String?` to Member model)

**Acceptance criteria:**

- [x] "Rotar carteirinha" generates a new card and reflects on the page
- [x] Admin note is saved and persists on page reload
- [x] No button or UI element allows direct subscription status change

---

### MEMBER-025 — Frontend — admin plan management

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-005, FOUND-013

**Objective:** Admin UI to create, edit, and deactivate membership plans.

**In scope:**

- Route: `/(admin)/plans`
- Table of all plans (active and inactive)
- "Novo plano" button → slide-over form
- Edit plan: same form pre-filled
- Deactivate: confirmation dialog → calls DELETE endpoint; shows `409` message if there are active subscribers

**Acceptance criteria:**

- [x] Creating a plan with no name shows inline validation error
- [x] Deactivating a plan with active subscribers shows the 409 message clearly
- [x] Inactive plans appear in the list with visual distinction

---

### MEMBER-026 — Monthly streak increment job

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-008, MEMBER-011

**Objective:** Increment the `adimplenciaStreakMonths` for all `ACTIVE` members every month.

**In scope:**

- BullMQ repeatable job (cron: monthly on the 1st day at 04:00 BRT).
- Queries all `Member` records where `Subscription.status == 'ACTIVE'`.
- Increments `adimplenciaStreakMonths` by 1.
- Note: If a member's streak reaches 12, they become eligible to vote (handled dynamically by the getter, but we might want to emit a Gamification event here if we choose to award points for reaching 1 year).

**Acceptance criteria:**

- [x] Running the job increments the streak for active members only
- [x] Suspended or cancelled members do not have their streak incremented

---

### MEMBER-027 — Offline PWA / Service Worker for check-in

**Phase:** 1 · Sócio-Torcedor  
**Size:** M  
**Depends on:** MEMBER-010, MEMBER-011

**Objective:** Allow stadium staff to validate QR codes even if internet connectivity drops temporarily.

**In scope:**

- Dedicated route `/(validator)` not linked from the main app.
- Service Worker caching the validation logic (public key verification of the JWT).
- Stores check-in events in IndexedDB if offline.
- Syncs to `POST /events/:eventId/checkin-bulk` when back online.
- Visual indicator: green screen for valid, red for invalid/expired.

**Acceptance criteria:**

- [x] Validator works when device is in airplane mode
- [x] Offline check-ins sync automatically upon reconnection
- [x] Invalid QR shows red screen

---

### MEMBER-028 — MatchEvent CRUD API (admin stub)

**Phase:** 1 · Sócio-Torcedor  
**Size:** S  
**Depends on:** MEMBER-003

**Objective:** Admin can create match events to link check-ins and partner deliverables against.

**In scope:**

- `POST /admin/events` — creates a `MatchEvent` (date, opponent, competition)
- `GET /admin/events` — list events
- Minimal UI in `/(admin)/eventos` just to create them (no complex management yet, full matchday is Phase 2/5).

**Acceptance criteria:**

- [x] Admin can create a match event
- [x] Check-in endpoint can link to the newly created event

---

## Phase 2 — Portal de Transparência

---

### TRANS-001 — Prisma schema — transparency module

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** FOUND-006

**Objective:** Prisma models for the transparency module migrated to the database.

**In scope:**

- Models: `TransparencyPost`, `DebtRecord`, `DebtSnapshot`
- Enums: `TransparencyCategory`, `DebtStatus`
- Self-relation on `TransparencyPost`: `supersededById`
- Index on `TransparencyPost(category, publishedAt)`
- Migration named `add_transparency_module`

**Acceptance criteria:**

- [x] Migration applies cleanly
- [x] Self-relation on `TransparencyPost` is correctly represented (previous version accessible via `supersededBy`)

---

### TRANS-002 — Zod schemas — transparency module

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** FOUND-004

**Objective:** Zod schemas for transparency module in `packages/schemas/src/transparency.ts`.

**In scope:**

- `CreateTransparencyPostSchema` — requires `referenceMonth` and `referenceYear` when category is `BALANCO_MENSAL` or `STATUS_DIVIDAS`
- `TransparencyPostResponseSchema`
- `CreateDebtRecordSchema`, `UpdateDebtRecordSchema`, `DebtRecordResponseSchema`
- `CreateDebtSnapshotSchema`, `DebtSnapshotResponseSchema`

**Acceptance criteria:**

- [x] `CreateTransparencyPostSchema.parse({ category: "BALANCO_MENSAL" })` without referenceMonth throws
- [x] Valid post with referenceMonth passes

---

### TRANS-003 — TransparencyPost CRUD API

**Phase:** 2 · Portal de Transparência  
**Size:** M  
**Depends on:** FOUND-008, TRANS-001, TRANS-002

**Objective:** Full CRUD for transparency posts with versioning and scheduling.

**In scope:**

- `GET /transparency/posts` — public; filter by `category`, `year`; paginated 10/page
- `GET /transparency/posts/:id` — public
- `POST /admin/transparency/posts` — ADMIN; supports `scheduledFor` field
- `PUT /admin/transparency/posts/:id` — creates new version (supersedes old one); old version `supersededById` set to new version's ID
- `PATCH /admin/transparency/posts/:id/archive` — sets `isArchived: true`
- Duplicate detection: `POST` returns `409` if a `BALANCO_MENSAL` post for the same month/year already exists and is not archived

**Acceptance criteria:**

- [x] Editing a published post creates a new version and marks old as superseded (not deleted)
- [x] Duplicate monthly balance post returns `409`
- [x] Archived posts do not appear in `GET /transparency/posts` public list
- [x] `GET /transparency/posts/:id` for superseded post returns it with `supersededById` populated

---

### TRANS-004 — DebtRecord + DebtSnapshot API

**Phase:** 2 · Portal de Transparência  
**Size:** M  
**Depends on:** FOUND-008, TRANS-001, TRANS-002

**Objective:** Admin manages debt records; system creates snapshots for the historical chart.

**In scope:**

- `GET /transparency/debts` — public; returns all debt records grouped by status
- `GET /transparency/debts/snapshots` — public; returns all snapshots ordered by date (for chart)
- `POST /admin/transparency/debts` — creates debt record
- `PATCH /admin/transparency/debts/:id` — updates amounts, status, publicNote
- `POST /admin/transparency/debts/snapshot` — manually triggers a snapshot (calculates totals from current records)
- Snapshot totals: `totalOriginal`, `totalNegotiated`, `totalPaid`, `totalRemaining` (= negotiated - paid, or original - paid if no negotiatedAmount)

**Acceptance criteria:**

- [x] Snapshot totals match the sum of current DebtRecord values
- [x] Second snapshot on same day is allowed (no uniqueness constraint on date — admin may correct)
- [x] `GET /transparency/debts/snapshots` returns ordered by `snapshotDate ASC`

---

### TRANS-005 — Monthly debt snapshot scheduled job

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** FOUND-009, TRANS-004

**Objective:** Automatic monthly snapshot created on the 1st of each month at 07:00 BRT.

**In scope:**

- BullMQ repeatable job: cron `0 10 1 * *` (10:00 UTC = 07:00 BRT)
- Calls the same snapshot creation logic as `POST /admin/transparency/debts/snapshot`
- Logs result (total remaining) via Pino

**Acceptance criteria:**

- [x] Job is registered at startup and visible in Bull Board
- [x] Running the job processor directly creates a DebtSnapshot record

---

### TRANS-006 — RSS feed endpoint

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** TRANS-003

**Objective:** RSS 2.0 feed of transparency posts, filterable by category.

**In scope:**

- `GET /transparency/feed.xml` — returns RSS 2.0 XML
- `GET /transparency/feed.xml?category=BALANCO_MENSAL` — filtered
- Last 20 published posts per feed
- Correct `Content-Type: application/rss+xml; charset=utf-8`
- Feed title, link, description pulled from env vars / config

**Acceptance criteria:**

- [x] Feed validates as valid RSS 2.0 (test with W3C validator)
- [x] Category filter returns only matching posts
- [x] New post appears in feed within 30s (no long-lived cache on this endpoint)

---

### TRANS-007 — Scheduled publishing BullMQ job

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** FOUND-009, TRANS-003

**Objective:** Posts with `scheduledFor` in the future are published automatically at that time.

**In scope:**

- When admin creates a post with `scheduledFor`, a BullMQ delayed job is enqueued with `delay = scheduledFor - now`
- Job processor sets `publishedAt = now`, clears `scheduledFor`, making the post appear in public listings
- If admin cancels a scheduled post (via archive), the pending job is removed from the queue

**Acceptance criteria:**

- [x] Post scheduled 5 minutes in future is not returned by `GET /transparency/posts` before the time
- [x] Post appears in `GET /transparency/posts` after `scheduledFor` time passes
- [x] Archiving a scheduled post removes the job from Bull Board

---

### TRANS-008 — Frontend — transparency portal homepage

**Phase:** 2 · Portal de Transparência  
**Size:** M  
**Depends on:** FOUND-013, TRANS-003, TRANS-004

**Objective:** Public landing page for the transparency portal with summary cards and latest posts.

**In scope:**

- Route: `/(public)/transparencia`
- Hero section: "Contas claras, futuro sólido" narrative
- 3 summary cards: total original debt, total remaining, number of renegotiated creditors
- Latest 3 posts per category (BALANCO_MENSAL, ATA_ASSEMBLEIA)
- "Ver todos os documentos" CTA
- Page is statically generated with ISR revalidation every 5 minutes

**Acceptance criteria:**

- [x] Page is accessible without login
- [x] Summary card numbers match `GET /transparency/debts` response
- [x] Page scores 90+ on Lighthouse accessibility

---

### TRANS-009 — Frontend — post list + category filter

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** TRANS-008

**Objective:** Paginated list of all transparency posts with category and year filters.

**In scope:**

- Route: `/(public)/transparencia/posts`
- Filter bar: category multi-select, year select
- Sorted by `publishedAt DESC`
- Each post card: title, category badge, reference month/year (if applicable), date, excerpt
- Pagination (10/page) with URL-based state (`?page=2&category=BALANCO_MENSAL`)

**Acceptance criteria:**

- [x] URL params persist on page reload
- [x] Category filter shows only posts of selected categories
- [x] Superseded posts do not appear (only current versions)
- [x] Post list shows a skeleton loader while fetching data
- [x] Post list shows a dedicated empty state component when no posts match filters

---

### TRANS-010 — Frontend — post detail (markdown render)

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** TRANS-009

**Objective:** Individual post page with markdown body rendered and PDF attachment downloadable.

**In scope:**

- Route: `/(public)/transparencia/posts/:id`
- Markdown rendered via `react-markdown` with `remark-gfm`
- PDF attachment download button (if `attachmentUrl` is set)
- "Versão anterior" link if post supersedes another
- OG meta tags with post title and excerpt
- Statically generated with ISR revalidation 1 hour

**Acceptance criteria:**

- [x] Markdown tables render correctly
- [x] PDF download button links to R2 URL
- [x] "Versão anterior" link is present and functional when applicable

---

### TRANS-011 — Frontend — debt dashboard (cards + chart)

**Phase:** 2 · Portal de Transparência  
**Size:** M  
**Depends on:** TRANS-008

**Objective:** Visual debt dashboard with creditor breakdown and historical trend chart.

**In scope:**

- Route: `/(public)/transparencia/dividas`
- Summary row: original total, negotiated total, paid to date, remaining
- Creditor table: name, original, negotiated, paid, remaining, status badge, public note
- Line chart: passivo total ao longo do tempo (from snapshots) — use `recharts`
- Status legend: EM_NEGOCIACAO, EM_DIA, ATRASADO, QUITADO with color coding

**Acceptance criteria:**

- [x] Chart renders with correct dates and values from snapshots
- [x] Table sorts by status (ATRASADO first)
- [x] Page renders with no chart if fewer than 2 snapshots exist (empty state)
- [x] Dashboard shows a skeleton loader while fetching data
- [x] Dashboard shows a dedicated empty state component when no data is available

---

### TRANS-012 — Frontend — document repository + search

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** FOUND-015, TRANS-008

**Objective:** Searchable document archive filtered by category and year.

**In scope:**

- Route: `/(public)/transparencia/documentos`
- Lists posts that have `attachmentUrl` set
- Client-side search by title (no API call — filter on fetched data)
- Filter by category and year
- Each item: icon by type (PDF), title, date, download link (R2 presigned URL)

**Acceptance criteria:**

- [x] Search filters results as user types (no debounce needed — client-side)
- [x] Download link opens the file directly (not a redirect chain)

---

### TRANS-013 — Frontend — admin transparency panel

**Phase:** 2 · Portal de Transparência  
**Size:** M  
**Depends on:** MEMBER-023, TRANS-003

**Objective:** Admin interface for creating, editing, and scheduling transparency posts.

**In scope:**

- Route: `/(admin)/transparencia`
- Table: all posts (including archived and scheduled), status badges
- "Nova publicação" button → slide-over form with: title, category, referenceMonth/Year (conditional), body (markdown editor with preview), PDF upload, scheduledFor date-time picker
- Edit: opens same form pre-filled (creates new version on save)
- Archive: confirmation dialog

**Acceptance criteria:**

- [x] Markdown editor shows live preview
- [x] Category BALANCO_MENSAL shows month/year fields; other categories hide them
- [x] Saving an edit shows the new version in the list with "versão atual" badge

---

### TRANS-014 — Frontend — admin debt records management

**Phase:** 2 · Portal de Transparência  
**Size:** M  
**Depends on:** TRANS-013, TRANS-004

**Objective:** Admin manages debt records and triggers manual snapshots.

**In scope:**

- Route: `/(admin)/transparencia/dividas`
- Table: all debt records with inline edit on `paidAmount`, `status`, `publicNote`
- "Novo credor" button → form
- "Criar snapshot agora" button → calls `POST /admin/transparency/debts/snapshot`; shows toast with new totals
- Snapshot history table: date, totals at that point

**Acceptance criteria:**

- [x] Inline edit saves on blur or Enter
- [x] "Criar snapshot" shows updated totals in toast immediately
- [x] Snapshot history table updates without page reload after creating snapshot

---

### TRANS-015 — SEO metadata + XML sitemap

**Phase:** 2 · Portal de Transparência  
**Size:** S  
**Depends on:** TRANS-008, TRANS-010

**Objective:** Correct OG tags, canonical URLs, and XML sitemap for all public pages.

**In scope:**

- `generateMetadata()` functions on all `(public)` route pages
- `apps/web/app/sitemap.ts` — dynamic sitemap including all published post URLs
- `apps/web/app/robots.ts` — disallows `(admin)` and `(member)` routes
- Verify with Lighthouse and `fetch /sitemap.xml`

**Acceptance criteria:**

- [x] `GET /sitemap.xml` returns valid XML including at least one transparency post URL
- [x] `GET /robots.txt` disallows `/admin` and `/member` paths
- [x] OG title and description are correct for a post detail page

---

## Phase 3 — CRM de Parceiros / Permutas

---

### PARTNER-001 — Prisma schema — partners module

**Phase:** 3 · CRM de Parceiros  
**Size:** S  
**Depends on:** FOUND-006

**Objective:** Prisma models for the partner CRM migrated.

**In scope:**

- Models: `Partner`, `SponsorshipDeal`, `Deliverable`, `DeliveryProof`
- Enums: `PartnerStatus`, `DealType`, `DealStatus`, `DeliverableFrequency`, `EvidenceType`
- Index on `SponsorshipDeal(endDate)` for expiration queries
- Migration named `add_partners_module`

**Acceptance criteria:**

- [x] Migration applies cleanly
- [x] `db.sponsorshipDeal.findMany({ where: { endDate: { lte: thirtyDaysFromNow } } })` is type-safe

---

### PARTNER-002 — Zod schemas — partners module

**Phase:** 3 · CRM de Parceiros  
**Size:** S  
**Depends on:** FOUND-004

**Objective:** Zod schemas for the partners module.

**In scope:**

- `CreatePartnerSchema`, `UpdatePartnerSchema`, `PartnerResponseSchema`
- `CreateSponsorshipDealSchema` — validates `endDate > startDate`
- `CreateDeliverableSchema`, `DeliverableResponseSchema`
- `CreateDeliveryProofSchema`, `DeliveryProofResponseSchema`
- CNPJ validation: 14 digits, format check only (no Receita Federal API)

**Acceptance criteria:**

- [x] `CreateSponsorshipDealSchema.parse({ startDate: "2026-12-01", endDate: "2026-01-01" })` throws
- [x] CNPJ with 13 digits throws

---

### PARTNER-003 — Partner CRUD API

**Phase:** 3 · CRM de Parceiros  
**Size:** S  
**Depends on:** FOUND-008, PARTNER-001, PARTNER-002

**Objective:** Admin-only CRUD for partners.

**In scope:**

- `GET /admin/partners` — filter by status, paginated
- `GET /admin/partners/:id` — includes deal history
- `POST /admin/partners`
- `PATCH /admin/partners/:id`
- `DELETE /admin/partners/:id` — sets `status: CANCELLED` (never hard deletes)

**Acceptance criteria:**

- [x] All routes return `403` without ADMIN role
- [x] Cancelled partner still appears in list with CANCELLED status
- [x] `GET /admin/partners/:id` includes `deals` relation

---

### PARTNER-004 — SponsorshipDeal CRUD API

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** PARTNER-003

**Objective:** Deal management with status tracking and owner assignment.

**In scope:**

- `GET /admin/partners/:partnerId/deals`
- `POST /admin/partners/:partnerId/deals`
- `PATCH /admin/deals/:id`
- `DELETE /admin/deals/:id` — sets `status: CANCELLED`, records `cancellationReason`
- `GET /admin/deals?expiringWithinDays=30` — for the dashboard widget

**Acceptance criteria:**

- [x] Cancelled deal is preserved with cancellation reason
- [x] `GET /admin/deals?expiringWithinDays=30` returns only deals ending within 30 days with `status: ACTIVE`

---

### PARTNER-005 — Deliverable management API

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** PARTNER-004

**Objective:** Deliverable tracking with pending delivery generation per MatchEvent.

**In scope:**

- `POST /admin/deals/:dealId/deliverables` — create deliverable
- `PATCH /admin/deliverables/:id`
- `GET /admin/deliverables/pending` — lists all deliverables with pending proofs for current month or next event
- When a `MatchEvent` is created (via `POST /admin/events`), all `POR_JOGO` deliverables for ACTIVE deals automatically generate a `PendingDelivery` record (add this join model to schema)
- `POST /admin/events` — creates MatchEvent and triggers pending delivery generation

**Acceptance criteria:**

- [x] Creating a MatchEvent generates one PendingDelivery per active POR_JOGO deliverable
- [x] `GET /admin/deliverables/pending` correctly identifies overdue and upcoming deliveries

---

### PARTNER-006 — DeliveryProof upload (R2 presigned URL)

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** FOUND-015, PARTNER-005

**Objective:** Admin uploads proof files directly to R2; API stores the reference.

**In scope:**

- `POST /admin/deliverables/:id/proof/upload-url` — generates R2 presigned upload URL; returns `{ uploadUrl, key }`
- `POST /admin/deliverables/:id/proof` — called after upload completes; creates `DeliveryProof` record with `fileUrl = R2_PUBLIC_URL + key`
- For LINK evidence type: `fileUrl` is the external URL (no R2 upload)
- Accepted file types: `image/jpeg`, `image/png`, `application/pdf` — validated by `contentType` param

**Acceptance criteria:**

- [x] Presigned URL uses the key convention from AGENTS.md §6.8
- [x] Uploading a `.exe` type returns `422`
- [x] `DeliveryProof` record `fileUrl` resolves to the public R2 CDN URL

---

### PARTNER-007 — PDF delivery proof report generation

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** PARTNER-006

**Objective:** Downloadable PDF report per deal listing all proof of delivery entries.

**In scope:**

- `GET /admin/deals/:id/proof-report.pdf` — generates and streams PDF using `@react-pdf/renderer`
- Returns `400` if deal has zero proof records (see RN-P03 in spec.md)
- Template: `apps/api/src/pdf/DeliveryProofReport.tsx`
- Content: club logo, partner name, deal period, table of deliverables with evidence (images embedded for photo type, URLs for link type), generation date

**Acceptance criteria:**

- [x] `GET /admin/deals/:id/proof-report.pdf` with zero proofs returns `400`
- [x] Generated PDF is valid and opens without error
- [x] Photo evidence is embedded in PDF (not just a link)
- [x] Response header is `Content-Type: application/pdf; Content-Disposition: attachment; filename=...`

---

### PARTNER-008 — Deal expiration alert jobs (D-30/15/7)

**Phase:** 3 · CRM de Parceiros  
**Size:** S  
**Depends on:** FOUND-009, FOUND-014, PARTNER-004

**Objective:** Admin responsible for a deal receives email alerts as it approaches expiration.

**In scope:**

- Daily BullMQ repeatable job (cron: `0 9 * * *`): queries `GET /admin/deals?expiringWithinDays=30`
- For each deal: checks if an alert for this interval was already sent (idempotency via a `DealAlert` table: dealId, alertType, sentAt)
- Sends email to `deal.owner.email` using `DealExpirationEmail` template
- Template: partner name, deal end date, list of deliverables, "renew" deep link

**Acceptance criteria:**

- [x] Alert for D-30 is sent only once per deal (even if job runs multiple times)
- [x] D-15 alert is sent even if D-30 was already sent (separate alert type)
- [x] Email contains correct deal details and renewal link

---

### PARTNER-009 — Frontend — admin partner list

**Phase:** 3 · CRM de Parceiros  
**Size:** S  
**Depends on:** FOUND-013, PARTNER-003

**Objective:** Admin table of all partners with status filter and quick-add.

**In scope:**

- Route: `/(admin)/parceiros`
- Table: trade name, segment, contact email, status badge, active deals count, actions
- Filter by status
- "Novo parceiro" button → slide-over form
- Click row → navigates to PARTNER-010

**Acceptance criteria:**

- [x] Active deals count is correct for each partner
- [x] Cancelled partners appear with visual distinction (muted row)
- [x] Partner list shows a skeleton loader while fetching data
- [x] Partner list shows a dedicated empty state component when no partners exist

---

### PARTNER-010 — Frontend — admin deal management

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** PARTNER-009, PARTNER-004

**Objective:** Admin manages deals for a partner: create, view, edit, cancel.

**In scope:**

- Route: `/(admin)/parceiros/:id`
- Partner header: name, status, contact info, edit button
- Deals tab: list of deals with status badges, start/end dates, type tag
- "Novo acordo" button → form: type, financial value, start/end dates, owner select, notes
- Deal card: expands to show deliverables list
- Cancel deal: confirmation dialog with `cancellationReason` text field
- Expiring soon deals highlighted (yellow border if < 30 days)

**Acceptance criteria:**

- [x] Cancelled deal shows cancellation reason in UI
- [x] Expiring deals (< 30 days) are visually highlighted
- [x] Owner select populates from list of ADMIN users

---

### PARTNER-011 — Frontend — admin deliverable tracker

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** PARTNER-010, PARTNER-005

**Objective:** Dashboard of pending and completed deliverables across all active deals.

**In scope:**

- Route: `/(admin)/parceiros/entregas`
- Tab 1: Pendentes — all deliverables with no proof for current period
- Tab 2: Concluídas — deliverables with proof this month
- Each row: partner name, deliverable description, frequency, responsible admin, "Registrar entrega" button
- "Registrar entrega" → opens PARTNER-012 upload flow inline

**Acceptance criteria:**

- [ ] Pendentes tab shows only current-period pending items (not future ones)
- [ ] After registering delivery, item moves from Pendentes to Concluídas without page reload

---

### PARTNER-012 — Frontend — proof upload + PDF export

**Phase:** 3 · CRM de Parceiros  
**Size:** M  
**Depends on:** PARTNER-011, PARTNER-006, PARTNER-007

**Objective:** Proof of delivery upload flow and PDF report generation trigger.

**In scope:**

- Upload slide-over (triggered from PARTNER-011): select evidence type → upload file or paste URL → optional note → save
- File upload uses presigned URL: `POST /upload-url` → upload directly to R2 → `POST /proof`
- Progress indicator during upload
- "Exportar relatório PDF" button on deal detail page → `GET /admin/deals/:id/proof-report.pdf` → triggers browser download
- Error state when attempting PDF export with no proofs

**Acceptance criteria:**

- [ ] File upload shows progress (0–100%)
- [ ] Upload of >10MB file shows error before attempting upload
- [ ] PDF download triggers browser file save dialog
- [ ] Attempting PDF with no proofs shows clear error message

---

## Phase 4 — Loja

---

### STORE-001 — Prisma schema — store module

**Phase:** 4 · Loja  
**Size:** S  
**Depends on:** FOUND-006

**Objective:** Prisma models for the store module migrated.

**In scope:**

- Models: `Product`, `ProductVariant`, `Order`, `OrderItem`
- Enums: `StockType`, `OrderStatus`
- Index on `Product(isActive, membersOnly)`
- Migration named `add_store_module`

**Acceptance criteria:**

- [ ] Migration applies cleanly
- [ ] `ProductVariant` has `sku` unique constraint

---

### STORE-002 — Zod schemas — store module

**Phase:** 4 · Loja  
**Size:** S  
**Depends on:** FOUND-004

**Objective:** Zod schemas for the store module.

**In scope:**

- `CreateProductSchema`, `UpdateProductSchema`, `ProductResponseSchema`
- `CreateOrderSchema` — validates items array is non-empty, quantities are positive
- `OrderResponseSchema`

**Acceptance criteria:**

- [ ] `CreateOrderSchema.parse({ items: [] })` throws
- [ ] `CreateOrderSchema.parse({ items: [{ quantity: 0 }] })` throws

---

### STORE-003 — Product CRUD API (admin)

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** FOUND-008, STORE-001, STORE-002

**Objective:** Admin manages products; public can list and view active products.

**In scope:**

- `GET /store/products` — public; only `isActive: true` products; `membersOnly` products are visible but flagged
- `GET /store/products/:id` — public
- `POST /admin/store/products` — ADMIN
- `PATCH /admin/store/products/:id` — ADMIN
- `DELETE /admin/store/products/:id` — sets `isActive: false`; returns `409` if there are open orders for this product

**Acceptance criteria:**

- [ ] `GET /store/products` includes `membersOnly: true` products (with the flag) — they are visible to all; purchasability checked at checkout
- [ ] Deactivating a product with open orders returns `409`

---

### STORE-004 — Stock management service

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** STORE-003

**Objective:** Atomic stock decrement for `ESTOQUE_FIXO` products, preventing negative stock.

**In scope:**

- `decrementStock(variantId, quantity, db)` — uses `SELECT ... FOR UPDATE` inside a transaction; throws `ConflictError("out_of_stock")` if `stockQuantity < quantity`. Decrements the actual stock.
- `incrementStock(variantId, quantity, db)` — increments stock (e.g. for refunded/returned items)
- `checkStock(variantId, db)` — returns current quantity without locking
- Alert mechanism: after decrement, if `stockQuantity <= stockAlertThreshold`, enqueues `send-email` job with `LowStockEmail` to admin
- `SOB_DEMANDA` products skip all stock checks

**Acceptance criteria:**

- [ ] Two simultaneous requests for the last item: exactly one succeeds, the other gets `ConflictError`
- [ ] Stock never goes below 0
- [ ] Admin receives email when stock hits threshold

---

### STORE-005 — Order creation + Mercado Pago one-time checkout

**Phase:** 4 · Loja  
**Size:** L  
**Depends on:** STORE-004, MEMBER-007

**Objective:** Guest or member creates an order and receives a Mercado Pago payment link.

**In scope:**

- `POST /store/orders` — authenticated or guest (no auth required for non-membersOnly items)
- Validates: all products exist and are active; `membersOnly` items require `ACTIVE` subscription
- Calls `checkStock` for `ESTOQUE_FIXO` items (verifies availability, but DOES NOT lock/reserve)
- Creates `Order` with `status: AGUARDANDO_PAGAMENTO`
- Creates Mercado Pago preference (one-time payment) and returns `{ orderId, checkoutUrl }`
- If user abandons payment (no webhook within 30min), a BullMQ delayed job cancels the order.
- NOTE: Stock is NOT reserved at order creation. It is only decremented upon successful payment to prevent malicious stock hoarding.

**Acceptance criteria:**

- [ ] Guest can order non-membersOnly items without auth
- [ ] MembersOnly item without ACTIVE subscription returns `403`
- [ ] Out-of-stock variant returns `409`
- [ ] Abandoned order (no payment in 30min) cancels the order (no stock release needed)

---

### STORE-006 — Order webhook handler + fulfillment flow

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** STORE-005

**Objective:** Payment confirmation transitions order to `PAGO` and triggers fulfillment notification.

**In scope:**

- Reuses the existing `POST /webhooks/mercadopago` handler (MEMBER-007) — extend the BullMQ processor to handle order payments (distinguish by checking if `paymentId` is linked to an `Order` or `Subscription`)
- On `payment.approved`: sets `Order.status = PAGO`, creates `Payment` record
- For `SOB_DEMANDA` items: enqueues `notify-admin-new-order` job → sends `NewOrderEmail` to admin with all items, variants, shipping address
- For `ESTOQUE_FIXO` items: same notification; decrement stock synchronously during webhook processing.
- Sends `OrderConfirmationEmail` to customer (guest email or member email)
- `PATCH /admin/store/orders/:id/status` — admin updates status to `EM_PRODUCAO`, `ENVIADO`, `ENTREGUE`, with optional `trackingCode`

**Acceptance criteria:**

- [ ] `payment.approved` for an order sets status to `PAGO` and sends confirmation email
- [ ] Admin receives new order email with full item details
- [ ] Admin can update order status; customer receives shipping email when status = `ENVIADO`

---

### STORE-007 — Frontend — product catalog

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** FOUND-013, STORE-003

**Objective:** Public product catalog with category filter and members-only indicators.

**In scope:**

- Route: `/(store)`
- Grid of product cards: image, name, price, "Exclusivo para sócios" badge if applicable
- Filter by category
- Sort by: relevance (default), price asc/desc
- Out-of-stock variants shown with "Esgotado" badge
- ISR revalidation 5 minutes

**Acceptance criteria:**

- [ ] MembersOnly products are visible with badge (not hidden)
- [ ] Out-of-stock variants are visually distinct
- [ ] ISR serves cached version to most users
- [ ] Catalog shows a skeleton loader while fetching data
- [ ] Catalog shows a dedicated empty state component when no products match filters

---

### STORE-008 — Frontend — product detail page

**Phase:** 4 · Loja  
**Size:** S  
**Depends on:** STORE-007

**Objective:** Product detail with variant selection and add-to-cart.

**In scope:**

- Route: `/(store)/produtos/:id`
- Image gallery
- Variant selector (size, color as applicable) — out-of-stock variants disabled
- Price display
- "Adicionar ao carrinho" button → navigates directly to checkout with `productId` and `variantSku` (no persistent cart in MVP)
- MembersOnly gate: non-members see "Exclusivo para sócios — faça seu cadastro" overlay on the CTA

**Acceptance criteria:**

- [ ] Out-of-stock variant is selectable but CTA is disabled
- [ ] Non-member trying to add a membersOnly product is shown the gate, not an error

---

### STORE-009 — Frontend — checkout flow

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** STORE-008, STORE-005

**Objective:** Single-page checkout: order summary → shipping info → payment.

**In scope:**

- Route: `/(store)/checkout`
- Section 1: order summary (product, variant, quantity, price)
- Section 2: customer info (email, name, CPF for nota fiscal) — pre-filled if logged in
- Section 3: shipping address (CEP → autocomplete via ViaCEP API)
- Section 4: Mercado Pago Brick for payment
- On success: redirects to order confirmation (STORE-010)

**Acceptance criteria:**

- [ ] CEP autocomplete fills address fields using ViaCEP
- [ ] Logged-in member has email and name pre-filled
- [ ] Successful payment redirects to order confirmation with correct order ID

---

### STORE-010 — Frontend — order confirmation + history

**Phase:** 4 · Loja  
**Size:** S  
**Depends on:** STORE-009

**Objective:** Post-purchase confirmation page and order history for logged-in members.

**In scope:**

- Route: `/(store)/pedidos/:id` — confirmation page; accessible to guest via order ID in URL
- Shows: order number, items, total, shipping address, expected handling
- Route: `/(member)/pedidos` — authenticated member's order history
- History table: order date, items summary, total, status badge

**Acceptance criteria:**

- [ ] Guest can access `/(store)/pedidos/:id` with just the URL (no login)
- [ ] Logged-in member sees all past orders in `/(member)/pedidos`

---

### STORE-011 — Frontend — admin product management

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** FOUND-013, STORE-003

**Objective:** Admin UI for creating and managing products.

**In scope:**

- Route: `/(admin)/loja/produtos`
- Table: name, category, price, stock type, stock quantity (if applicable), active status
- "Novo produto" → form with image upload (to R2 via presigned URL), variants section (add/remove)
- Edit product: same form pre-filled
- Deactivate: confirmation dialog

**Acceptance criteria:**

- [ ] Image upload shows preview before saving
- [ ] Variants can be added/removed dynamically in the form
- [ ] Deactivating with open orders shows the 409 message

---

### STORE-012 — Frontend — admin order management

**Phase:** 4 · Loja  
**Size:** M  
**Depends on:** STORE-006, STORE-011

**Objective:** Admin views and manages all orders.

**In scope:**

- Route: `/(admin)/loja/pedidos`
- Table: order number, date, customer, items count, total, status badge
- Filter by status
- Click row → order detail slide-over: full items list, shipping address, payment info
- Status update dropdown: `EM_PRODUCAO`, `ENVIADO` (requires tracking code), `ENTREGUE`
- "Notificar cliente" button on status change (triggers email)

**Acceptance criteria:**

- [ ] Status change to `ENVIADO` requires tracking code (inline validation)
- [ ] Status change triggers customer email
- [ ] `SOB_DEMANDA` orders clearly marked in the table
- [ ] Order list shows a skeleton loader while fetching data
- [ ] Order list shows a dedicated empty state component when no orders exist

---

## Phase 5 — Production Readiness

---

### PROD-001 — Rate limiting on all public endpoints

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** FOUND-008

**Objective:** Protect all public-facing endpoints from abuse with per-route rate limits.

**In scope:**

- `POST /auth/register`: 5 requests / 15min per IP
- `POST /auth/login`: 10 requests / 15min per IP
- `POST /webhooks/mercadopago`: 100 requests / min (high volume expected)
- `GET /store/products`, `GET /transparency/*`: 60 requests / min per IP
- `GET /stats/members`: exempt (Redis-cached, low DB load)
- Rate limit storage in Redis (`@fastify/rate-limit` with Redis store)
- Response on limit: `429` with `Retry-After` header

**Acceptance criteria:**

- [ ] 6th login attempt in 15 minutes returns `429`
- [ ] `Retry-After` header is present on `429` response
- [ ] Webhook endpoint is not rate-limited below 100/min

---

### PROD-002 — Security headers (CSP, HSTS, CORS)

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** FOUND-002, FOUND-003

**Objective:** Standard security headers applied to all responses.

**In scope:**

- Next.js: security headers in `next.config.ts`: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- CSP: allow `self`, Mercado Pago SDK domain, Sentry, R2 CDN; block `unsafe-eval` and `unsafe-inline` (test that MP Brick still works after CSP)
- Fastify: `@fastify/helmet` with equivalent headers
- CORS: only `NEXT_PUBLIC_APP_URL` allowed on API; webhook endpoint allows MP IPs

**Acceptance criteria:**

- [ ] `https://securityheaders.com` scan returns A grade
- [ ] Mercado Pago Brick renders correctly with CSP applied
- [ ] API returns `403` on CORS request from an unknown origin

---

### PROD-003 — LGPD compliance (anonymization, data export)

**Phase:** 5 · Produção  
**Size:** M  
**Depends on:** MEMBER-001, MEMBER-003

**Objective:** Member can export their data and request account deletion; system anonymizes correctly.

**In scope:**

- `GET /members/me/export` — returns JSON with all member data (profile, subscriptions, payments, orders) in a downloadable file; logged in audit table
- `DELETE /members/me` — anonymizes: `name = "Sócio Removido"`, `email = sha256(email)`, `cpf = sha256(cpf)`, `phone = null`, `address = null`; sets `isAnonymized: true` on Member; preserves Payment and Order records for fiscal purposes; cancels any active subscription via MP API first
- CPF and email columns get unique constraints preserved post-anonymization (SHA256 hash ensures no re-registration with same CPF)
- Audit log table (`AuditLog`: action, memberId, performedBy, timestamp, metadata) — logs: data export, account deletion, admin role assignment, and consent log (marketing/whatsapp opt-ins)

**Acceptance criteria:**

- [ ] Post-anonymization, `GET /members/:id` returns no PII (name shows "Sócio Removido")
- [ ] Anonymized member cannot log in
- [ ] Payment records still exist post-anonymization with anonymized memberId reference
- [ ] Data export includes all data and downloads as a `.json` file

---

### PROD-004 — Cookie consent banner

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** FOUND-013

**Objective:** LGPD-compliant cookie consent for the web app.

**In scope:**

- Banner shown on first visit to any `(public)` page
- Options: "Aceitar todos", "Apenas essenciais"
- Consent stored in localStorage (irony noted — but standard for consent itself), and synced to backend `ConsentLog` table if the user is authenticated.
- Sentry and analytics only loaded after consent
- `/(public)/privacidade` — privacy policy page (content provided by club lawyer; create placeholder)

**Acceptance criteria:**

- [ ] Banner does not appear on `(admin)` or `(member)` routes (authenticated users already consented at registration)
- [ ] Sentry JS is not loaded until consent is given
- [ ] Consent choice persists across page reloads

---

### PROD-005 — Database backup strategy + restore test

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** FOUND-005

**Objective:** Automated daily PostgreSQL backups with tested restore procedure.

**In scope:**

- `docker-compose.yml` addition: `pg_backup` service using `prodrigestivill/postgres-backup-local`
- Daily backup to `/backups/` volume at 02:00 BRT, 7-day retention
- Backup files encrypted with AES-256 using `BACKUP_ENCRYPTION_KEY` env var
- `docs/runbooks/restore-database.md` — step-by-step restore procedure
- Restore test: documented and verified (run once against staging)

**Acceptance criteria:**

- [ ] Backup file created within 24h of setup
- [ ] Restore procedure tested successfully against a staging database
- [ ] Backup files are encrypted (cannot be read without key)

---

### PROD-006 — VPS hardening (firewall, SSH, fail2ban)

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** FOUND-011

**Objective:** VPS configured to minimize attack surface.

**In scope:**

- `ufw` firewall: allow 22 (SSH), 80, 443; deny everything else
- SSH: key-only auth, root login disabled, non-default port (documented in runbook)
- `fail2ban` configured for SSH brute-force protection
- Docker daemon not exposed on network (only accessible via socket)
- All configuration documented in `docs/runbooks/vps-setup.md`

**Acceptance criteria:**

- [ ] Port scan of VPS shows only 22 (or custom SSH port), 80, 443 open
- [ ] SSH with password returns permission denied
- [ ] `fail2ban` is active: `fail2ban-client status sshd` shows active jail

---

### PROD-007 — Staging environment + deploy pipeline

**Phase:** 5 · Produção  
**Size:** M  
**Depends on:** FOUND-010

**Objective:** Complete CI/CD pipeline: staging auto-deploy on merge to `main`, production deploy on version tag.

**In scope:**

- `web` and `api` services added to `docker-compose.yml` with build contexts
- Multi-stage `Dockerfile` for `apps/web` and `apps/api` (build stage + runtime stage)
- `.github/workflows/deploy-staging.yml` — triggers on push to `main`; builds images, pushes to registry, SSHs to staging VPS and runs `docker compose pull && docker compose up -d`
- `.github/workflows/deploy-production.yml` — triggers on `v*` tag; same steps targeting production VPS
- `docker-compose.staging.yml` override with staging env vars
- Zero-downtime deploy: pull new image while old container runs, then `docker compose up -d` triggers rolling restart

**Acceptance criteria:**

- [ ] Push to `main` triggers staging deploy automatically
- [ ] Staging deploy completes without downtime (health check remains `200` during deploy)
- [ ] `git tag v1.0.0 && git push --tags` triggers production deploy
- [ ] Rollback procedure documented: `docker compose up -d --scale api=0 && docker compose up -d` with previous image tag

---

### PROD-008 — Load test — matchday simulation

**Phase:** 5 · Produção  
**Size:** M  
**Depends on:** All modules

**Objective:** System handles matchday traffic spike without degradation.

**In scope:**

- k6 load test scripts in `tests/load/`
- Scenario: 500 concurrent users over 10 minutes simulating: `GET /stats/members` (public counter), `GET /store/products` (catalog browsing), `POST /events/:id/checkin` (QR validation), `GET /transparency/posts` (transparency portal)
- Target: p95 response time < 500ms, error rate < 0.1%
- Run against staging environment
- Results documented in `docs/load-test-results.md`

**Acceptance criteria:**

- [ ] p95 response time < 500ms under 500 concurrent users
- [ ] Error rate < 0.1% under load
- [ ] Redis cache hit rate > 90% for `/stats/members` under load (verify via Redis INFO)
- [ ] No OOM or container crash during the test

---

### PROD-009 — Monitoring + alerting (Sentry + uptime)

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** FOUND-012

**Objective:** Proactive alerting for errors and downtime.

**In scope:**

- Sentry alert rules: notify via email if error rate > 5/min for any endpoint
- Sentry performance monitoring: set up transaction tracing for `POST /webhooks/mercadopago` and `POST /store/orders`
- Uptime monitoring: BetterUptime or UptimeRobot (free tier) checking `GET /health` every 1 minute; alerting via email + Telegram (if club has a technical contact channel)
- Sentry issue assignment: all unassigned errors auto-assigned to the developer's Sentry account

**Acceptance criteria:**

- [ ] A manually triggered 500 error in staging is captured in Sentry within 30 seconds
- [ ] Uptime check sends alert within 2 minutes of the service going down (simulate by stopping the api container)

---

### PROD-010 — Production deployment runbook

**Phase:** 5 · Produção  
**Size:** S  
**Depends on:** All PROD tasks

**Objective:** Complete operational documentation for going live and maintaining the system.

**In scope:**

- `docs/runbooks/go-live-checklist.md`:
  - [ ] DNS records configured (A records for tubarao.fc and api.tubarao.fc)
  - [ ] All production env vars set and verified
  - [ ] Mercado Pago production credentials configured and webhook URL registered
  - [ ] R2 bucket CORS policy configured for production domain
  - [ ] Sentry DSN points to production environment
  - [ ] First admin account created manually via Prisma Studio or seed script
  - [ ] Backup service running and first backup verified
  - [ ] Load test passed on staging
  - [ ] VPS hardening complete
- `docs/runbooks/common-operations.md`: how to add an admin user, rotate JWT keys, manually trigger a debt snapshot, pause the delinquency job
- `docs/runbooks/incident-response.md`: what to do if the webhook stops processing, if the database is full, if a member reports wrong status

**Acceptance criteria:**

- [ ] A developer unfamiliar with the project can deploy to production using only the runbook
- [ ] Go-live checklist is fully checked before any real member data is collected
