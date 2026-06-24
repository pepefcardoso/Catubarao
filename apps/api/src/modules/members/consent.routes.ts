import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateConsentSchema } from "@repo/schemas/consent";
import { saveConsentLog } from "./consent.service";
import { prisma } from "@repo/db";

export const consentRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/",
    {
      schema: {
        tags: ["consent"],
        body: CreateConsentSchema,
        response: {
          201: CreateConsentSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const ipAddress = request.ip;
      const userAgent = request.headers["user-agent"];

      await saveConsentLog(memberId, request.body, ipAddress, userAgent, prisma);

      return reply.status(201).send(request.body);
    }
  );
};
