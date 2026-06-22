import fp from "fastify-plugin";
import { prisma } from "@repo/db";

export default fp(async (fastify) => {
  fastify.decorate("prisma", prisma);
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}
