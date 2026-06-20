import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UpdateMemberProfileSchema, MeResponseSchema } from "@repo/schemas/member";
import { getMe, updateMe } from "./members.service";
import { prisma } from "@repo/db";

export const membersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/me",
    {
      schema: {
        tags: ["members"],
        response: {
          200: MeResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const me = await getMe(memberId, prisma);
      return reply.status(200).send(me);
    }
  );

  fastify.patch(
    "/me",
    {
      schema: {
        tags: ["members"],
        body: UpdateMemberProfileSchema,
        response: {
          200: MeResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      await updateMe(memberId, request.body, prisma);
      // Fetch the updated profile with adimplencia calculation
      const me = await getMe(memberId, prisma);
      return reply.status(200).send(me);
    }
  );
};

