import { env } from "./lib/env";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
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

// Global Error Handler
fastify.setErrorHandler(errorHandler);

// Plugins
fastify.register(cors, {
  origin: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
});

fastify.register(rateLimit, {
  global: false,
});

fastify.register(multipart);

import redisPlugin from "./plugins/redis";
fastify.register(redisPlugin);

import swaggerPlugin from "./plugins/swagger";
fastify.register(swaggerPlugin);

import authPlugin from "./plugins/auth";
fastify.register(authPlugin);

import queuesPlugin from "./plugins/queues";
fastify.register(queuesPlugin);

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
