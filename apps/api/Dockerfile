FROM node:22-alpine AS alpine
RUN apk update && apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM alpine AS builder
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune api --docker

FROM alpine AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=api

FROM alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
USER fastify

# Copy built app and dependencies
COPY --from=installer --chown=fastify:nodejs /app .

EXPOSE 3001

ENV PORT=3001
ENV HOST=0.0.0.0

WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
