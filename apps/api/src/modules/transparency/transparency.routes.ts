import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateTransparencyPostSchema,
  TransparencyPostResponseSchema,
  TransparencyCategorySchema,
  CreateDebtRecordSchema,
  UpdateDebtRecordSchema,
  DebtRecordResponseSchema,
  DebtSnapshotResponseSchema,
  AnnouncementBannerResponseSchema,
} from "@repo/schemas/transparency";
import {
  getPosts,
  getAdminPosts,
  getPostById,
  createPost,
  updatePost,
  archivePost,
  getDebts,
  getDebtSnapshots,
  createDebtRecord,
  updateDebtRecord,
  createDebtSnapshot,
  generateFeedXml,
  getActiveAnnouncements,
} from "./transparency.service";
import { env } from "../../lib/env";
import { getUploadUrl, buildStorageKey } from "../../lib/storage";

export const transparencyRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/feed.xml",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
      schema: {
        tags: ["transparency"],
        querystring: z.object({
          category: TransparencyCategorySchema.optional(),
        }),
      },
    },
    async (request, reply) => {
      const xml = await generateFeedXml(fastify.prisma, request.query.category);
      return reply.type("application/rss+xml; charset=utf-8").send(xml);
    }
  );

  fastify.get(
    "/announcements",
    {
      schema: {
        tags: ["transparency"],
        response: {
          200: z.array(AnnouncementBannerResponseSchema),
        },
      },
    },
    async (_request, reply) => {
      const banners = await getActiveAnnouncements(fastify.prisma);
      return reply.send(banners);
    }
  );

  fastify.get(
    "/posts",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
      schema: {
        tags: ["transparency"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(10),
          category: z.union([TransparencyCategorySchema, z.array(TransparencyCategorySchema)]).optional(),
          referenceYear: z.coerce.number().optional(),
          hasAttachment: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
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
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
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

  fastify.get(
    "/admin/posts",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(50),
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
      const result = await getAdminPosts(fastify.prisma, request.query);
      return reply.send(result);
    }
  );

  fastify.post(
    "/posts/upload-url",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency"],
        body: z.object({
          filename: z.string().min(1),
          contentType: z.string().min(1),
          entityId: z.string().min(1),
        }),
        response: {
          200: z.object({
            uploadUrl: z.string().url(),
            attachmentUrl: z.string().url(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { filename, contentType, entityId } = request.body;
      const key = buildStorageKey("transparency", entityId, filename);
      const uploadUrl = await getUploadUrl(key, contentType);
      const attachmentUrl = `${env.R2_PUBLIC_URL}/${key}`;
      return reply.send({ uploadUrl, attachmentUrl });
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
      const post = await createPost(request.body, request.user.id, fastify.prisma, fastify.queues);
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
      const post = await updatePost(request.params.id, request.body, request.user.id, fastify.prisma, fastify.queues);
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
      const post = await archivePost(request.params.id, fastify.prisma, fastify.queues);
      return reply.send(post);
    }
  );

  fastify.get(
    "/debts",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
      schema: {
        tags: ["transparency", "debts"],
        response: {
          200: z.record(z.string(), z.array(DebtRecordResponseSchema)),
        },
      },
    },
    async (request, reply) => {
      const groupedDebts = await getDebts(fastify.prisma);
      return reply.send(groupedDebts);
    }
  );

  fastify.get(
    "/debts/snapshots",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
      schema: {
        tags: ["transparency", "debts"],
        response: {
          200: z.array(DebtSnapshotResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const snapshots = await getDebtSnapshots(fastify.prisma);
      return reply.send(snapshots);
    }
  );

  fastify.post(
    "/debts",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency", "debts"],
        body: CreateDebtRecordSchema,
        response: {
          201: DebtRecordResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const debt = await createDebtRecord(request.body, fastify.prisma);
      return reply.status(201).send(debt);
    }
  );

  fastify.patch(
    "/debts/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency", "debts"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateDebtRecordSchema,
        response: {
          200: DebtRecordResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const debt = await updateDebtRecord(request.params.id, request.body, fastify.prisma);
      return reply.send(debt);
    }
  );

  fastify.post(
    "/debts/snapshot",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["transparency", "debts"],
        response: {
          201: DebtSnapshotResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const snapshot = await createDebtSnapshot(fastify.prisma, request.user.id);
      await fastify.queues.scheduled.add("debt-milestone-check", { snapshotId: snapshot.id });
      return reply.status(201).send(snapshot);
    }
  );
};
