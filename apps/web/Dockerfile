FROM node:22-alpine AS alpine
RUN apk update && apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM alpine AS builder
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune web --docker

FROM alpine AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=web

FROM alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/web/next.config.ts .
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
