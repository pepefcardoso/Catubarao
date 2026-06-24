<!-- README.md -->

# Clube Atlético Tubarão SAF — Plataforma Digital

Plataforma digital do Clube Atlético Tubarão Saf: sócio-torcedor, portal de transparência, CRM de parceiros e loja. Construída sob regime de RCE (Lei 14.193/2021) — disciplina financeira e rastreabilidade são requisitos de negócio, não apenas boas práticas.

> 📄 Antes de contribuir, leia [`AGENTS.md`](./AGENTS.md) (regras de arquitetura e hard rules), [`SPEC.md`](./SPEC.md) (requisitos de negócio) e [`DESIGN.md`](./DESIGN.md) (padrões de UI/UX).

## Stack

| Camada        | Tecnologia                                         |
| ------------- | -------------------------------------------------- |
| Frontend      | Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui |
| API           | Fastify 5, Zod, fastify-type-provider-zod          |
| ORM / DB      | Prisma 6, PostgreSQL 16, PgBouncer                 |
| Cache / Queue | Redis 7, BullMQ                                    |
| Auth          | Better Auth                                        |
| Storage       | Cloudflare R2 (S3-compatible)                      |
| Email         | Resend + React Email                               |
| Pagamento     | Mercado Pago SDK                                   |
| Observability | Sentry, Pino                                       |
| Infra         | Docker Compose, Caddy, Turborepo, pnpm             |

## Estrutura

```
apps/
  web/      # Next.js — (public) (member) (admin) (store) route groups
  api/      # Fastify — modules: members, transparency, partners, store, webhooks
packages/
  db/       # Prisma schema + client singleton
  schemas/  # Zod schemas (source of truth, shared web/api)
  ui/       # shadcn/ui components
  config/   # tsconfig/eslint compartilhados
docs/
  adr/          # Architecture Decision Records
  acceptance/   # Gherkin por módulo
  webhooks/     # Referência de payloads Mercado Pago
```

## Setup

```bash
git clone <repo>
pnpm install

cp .env.example .env.local
# preencha as variáveis (ver seção abaixo)

docker compose up postgres pgbouncer redis -d
# ou: make up

pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Comandos

```bash
pnpm dev                    # todos os apps (turbo)
pnpm build                  # build de produção
pnpm lint / pnpm lint:fix
pnpm typecheck
pnpm test / pnpm test:watch

pnpm db:migrate              # nova migration (dev)
pnpm db:studio                # Prisma Studio
pnpm db:generate              # regenerar client após mudança no schema
pnpm db:reset                  # drop + recreate + migrate + seed (dev only)

pnpm --filter web dev
pnpm --filter api dev
```

## Variáveis de ambiente

Ver [`.env.example`](./.env.example) — inclui banco de dados, Redis, Better Auth, Mercado Pago, Cloudflare R2, par de chaves ES256 (QR da carteirinha), Resend e Sentry. Cada nova variável **deve** ser documentada lá antes de ser usada em código.

## Módulos (ordem de prioridade)

1. **Sócio-Torcedor** — cadastro, planos, cobrança recorrente, carteirinha digital com QR assinado (offline-verificável), gamificação, direito de voto.
2. **Portal de Transparência** — publicações versionadas (imutáveis), dashboard de dívidas, snapshots append-only.
3. **CRM de Parceiros/Permutas** — acordos, contrapartidas, prova de entrega.
4. **Loja** — catálogo, checkout, controle de estoque.
5. **Matchday/Ingressos** — Fase 2, não implementar sem instrução explícita.

## Regras críticas (resumo)

- Nunca instanciar `PrismaClient` fora de `packages/db`.
- Nunca processar webhooks do Mercado Pago de forma síncrona — sempre enfileirar via BullMQ.
- Nunca hard-deletar `TransparencyPost`, `SponsorshipDeal`/`DeliveryProof` ou `DebtSnapshot` — apenas arquivar/versionar.
- Atualização de status de pagamento/assinatura flui **exclusivamente** por webhook.
- CPF/PII nunca em logs (mascarar) nem em query params.

Lista completa de hard rules em [`AGENTS.md §9`](./AGENTS.md#9-hard-rules--never-do-these).

## Testes

```bash
pnpm test        # deve passar sem falhas antes de qualquer commit
pnpm typecheck
pnpm lint
```

Testes colocados ao lado do arquivo testado (`*.service.test.ts`). Toda hard rule da seção 9 do `AGENTS.md` deve ter pelo menos um teste cobrindo-a.
