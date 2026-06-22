import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreatePollSchema,
  PollResponseSchema,
  PollWithCountsResponseSchema,
  PollResultResponseSchema,
} from "@repo/schemas/member";
import {
  createPoll,
  listOpenPolls,
  getPollWithCounts,
  castVote,
  getPollResult,
} from "./polls.service";

export const pollsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/admin/polls",
    {
      schema: {
        tags: ["polls"],
        body: CreatePollSchema,
        response: {
          201: PollResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const poll = await createPoll(request.body, fastify.prisma, fastify.queues.scheduled);
      return reply.status(201).send(poll);
    },
  );

  fastify.get(
    "/polls",
    {
      schema: {
        tags: ["polls"],
        response: {
          200: z.array(PollResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const polls = await listOpenPolls(fastify.prisma);
      return reply.send(polls);
    },
  );

  fastify.get(
    "/polls/:id",
    {
      schema: {
        tags: ["polls"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: PollWithCountsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const poll = await getPollWithCounts(request.params.id, fastify.prisma);
      return reply.send(poll);
    },
  );

  fastify.post(
    "/polls/:id/vote",
    {
      schema: {
        tags: ["polls"],
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ optionId: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      await castVote(
        request.params.id,
        request.user.id,
        request.body.optionId,
        fastify.prisma,
      );
      return reply.status(204).send(null as any);
    },
  );

  fastify.get(
    "/polls/:id/result",
    {
      schema: {
        tags: ["polls"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: PollResultResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await getPollResult(request.params.id, fastify.prisma);
      return reply.send(result);
    },
  );
};
