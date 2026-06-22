import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateTransparencyPostSchema,
  TransparencyPostResponseSchema,
  TransparencyCategorySchema,
} from "@repo/schemas/transparency";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  archivePost,
} from "./transparency.service";

export const transparencyRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/posts",
    {
      schema: {
        tags: ["transparency"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(10),
          category: TransparencyCategorySchema.optional(),
          referenceYear: z.coerce.number().optional(),
        }),
        response: {
          200: z.object({
            posts: z.array(TransparencyPostResponseSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await getPosts(fastify.prisma, request.query);
      return reply.send(result);
    }
  );

  fastify.get(
    "/posts/:id",
    {
      schema: {
        tags: ["transparency"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: TransparencyPostResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const post = await getPostById(request.params.id, fastify.prisma);
      return reply.send(post);
    }
  );

  fastify.post(
    "/posts",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency"],
        body: CreateTransparencyPostSchema,
        response: {
          201: TransparencyPostResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const post = await createPost(request.body, request.user.id, fastify.prisma);
      return reply.status(201).send(post);
    }
  );

  fastify.put(
    "/posts/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency"],
        params: z.object({ id: z.string().uuid() }),
        body: CreateTransparencyPostSchema,
        response: {
          200: TransparencyPostResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const post = await updatePost(request.params.id, request.body, request.user.id, fastify.prisma);
      return reply.send(post);
    }
  );

  fastify.patch(
    "/posts/:id/archive",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: TransparencyPostResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const post = await archivePost(request.params.id, fastify.prisma);
      return reply.send(post);
    }
  );
};
