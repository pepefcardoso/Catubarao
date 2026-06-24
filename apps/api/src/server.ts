import "./instrument";
import { env } from "./lib/env";
import Fastify from "fastify";
import * as Sentry from "@sentry/node";
import cors from "@fastify/cors";

import multipart from "@fastify/multipart";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { errorHandler } from "./lib/errorHandler";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const environment = process.env.NODE_ENV || "development";

const fastify = Fastify({
  logger: envToLogger[environment as keyof typeof envToLogger] ?? true,
});

// Zod type provider configuration
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Sentry error handler setup
Sentry.setupFastifyErrorHandler(fastify);

// Global Error Handler
fastify.setErrorHandler(errorHandler);

import helmet from "@fastify/helmet";
import { ForbiddenError } from "./lib/errors";

// Plugins
fastify.register(helmet, {
  contentSecurityPolicy: false, // Disabling because API usually doesn't serve HTML, but we apply other headers
});

fastify.register(cors, {
  origin: (origin, cb) => {
    // allow server-to-server requests (no origin)
    if (!origin) {
      return cb(null, true);
    }
    const allowedOrigin = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (origin === allowedOrigin || origin === "http://localhost:3000") {
      return cb(null, true);
    }
    cb(new ForbiddenError("CORS request from unknown origin"), false);
  },
  credentials: true,
});



fastify.register(multipart);

import redisPlugin from "./plugins/redis";
fastify.register(redisPlugin);

import rateLimitPlugin from "./plugins/rate-limit";
fastify.register(rateLimitPlugin);

import swaggerPlugin from "./plugins/swagger";
fastify.register(swaggerPlugin);

import authPlugin from "./plugins/auth";
fastify.register(authPlugin);

import queuesPlugin from "./plugins/queues";
fastify.register(queuesPlugin);

import { authRoutes } from "./modules/auth/auth.routes";
fastify.register(authRoutes, { prefix: "/auth" });

import { membersRoutes } from "./modules/members/members.routes";
fastify.register(membersRoutes, { prefix: "/members" });

import { consentRoutes } from "./modules/members/consent.routes";
fastify.register(consentRoutes, { prefix: "/consent" });

import { plansRoutes } from "./modules/members/plans.routes";
fastify.register(plansRoutes);

import { subscriptionsRoutes } from "./modules/members/subscriptions.routes";
fastify.register(subscriptionsRoutes, { prefix: "/subscriptions" });

import { mercadopagoRoutes } from "./modules/webhooks/mercadopago.routes";
fastify.register(mercadopagoRoutes, { prefix: "/webhooks" });

import { gamificationRoutes } from "./modules/members/gamification.routes";
fastify.register(gamificationRoutes);

import { eventsRoutes } from "./modules/members/events.routes";
fastify.register(eventsRoutes);

import { pollsRoutes } from "./modules/members/polls.routes";
fastify.register(pollsRoutes);

import { statsRoutes } from "./modules/members/stats.routes";
fastify.register(statsRoutes);

import { transparencyRoutes } from "./modules/transparency/transparency.routes";
fastify.register(transparencyRoutes, { prefix: "/transparency" });

import { partnersRoutes } from "./modules/partners/partners.routes";
fastify.register(partnersRoutes);

import { dealsRoutes } from "./modules/partners/deals.routes";
fastify.register(dealsRoutes);

import { deliverablesRoutes } from "./modules/partners/deliverables.routes";
fastify.register(deliverablesRoutes);

import { productsRoutes } from "./modules/store/products.routes";
fastify.register(productsRoutes);

import { ordersRoutes } from "./modules/store/orders.routes";
fastify.register(ordersRoutes, { prefix: "/store/orders" });

// Health check endpoint

fastify.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Server is running at http://localhost:${port}`);
    fastify.log.info(`Swagger docs at http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export default fastify;
