import fp from "fastify-plugin";
import Redis from "ioredis";
import { env } from "../lib/env";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(
  async (fastify) => {
    const redis = new Redis({
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    });

    redis.on("error", (err) => {
      fastify.log.error(err, "Redis connection error");
    });

    // Verify connection at startup
    const pong = await redis.ping();
    if (pong !== "PONG") {
      throw new Error("Redis ping failed");
    }
    fastify.log.info("Redis connected successfully");

    fastify.decorate("redis", redis);

    fastify.addHook("onClose", async (instance) => {
      await instance.redis.quit();
    });
  },
  { name: "redis" },
);
