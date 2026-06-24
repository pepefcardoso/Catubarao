import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export default fp(
  async (fastify) => {
    await fastify.register(rateLimit, {
      global: false,
      redis: fastify.redis,
      allowList: (req) => process.env.NODE_ENV === "test" || req.ip.startsWith("127.") || req.ip.startsWith("172.") || req.ip.startsWith("192.168.") || req.ip === "::1",
    });
  },
  { name: "rate-limit", dependencies: ["redis"] },
);
