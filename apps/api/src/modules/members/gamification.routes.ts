import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { MemberPointsResponseSchema, LeaderboardResponseSchema } from "@repo/schemas/gamification";
import { getMemberPoints, getLeaderboard } from "./gamification.service";
import { z } from "zod";

export const gamificationRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/members/me/points",
    {
      schema: {
        tags: ["gamification"],
        response: {
          200: MemberPointsResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const result = await getMemberPoints(request.user.id, fastify.prisma);
      return reply.status(200).send(result);
    }
  );

  fastify.get(
    "/leaderboard",
    {
      schema: {
        tags: ["gamification"],
        querystring: z.object({
          limit: z.coerce.number().int().min(1).max(100).default(20),
        }),
        response: {
          200: LeaderboardResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const limit = request.query.limit;
      const result = await getLeaderboard(limit, fastify.prisma);
      return reply.status(200).send(result);
    }
  );
};
