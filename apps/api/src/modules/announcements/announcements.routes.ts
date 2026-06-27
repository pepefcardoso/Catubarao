import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateAnnouncementBannerSchema,
  AnnouncementBannerResponseSchema,
  BannerTypeSchema,
} from "@repo/schemas/banner";
import {
  getActiveAnnouncements,
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./announcements.service";
import { env } from "../../lib/env";

export const announcementsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["announcements"],
        querystring: z.object({
          type: BannerTypeSchema.optional(),
        }),
        response: {
          200: z.array(AnnouncementBannerResponseSchema),
        },
      },
      config: {
        // Cache in redis using fastify-caching or custom middleware logic if standard
      },
    },
    async (request, reply) => {
      const cacheKey = `announcements:${request.query.type || "ALL"}`;
      
      const cached = await fastify.redis.get(cacheKey);
      if (cached) {
        return reply.send(JSON.parse(cached));
      }

      const banners = await getActiveAnnouncements(fastify.prisma, request.query.type);
      
      await fastify.redis.set(cacheKey, JSON.stringify(banners), "EX", 60);

      return reply.send(banners);
    }
  );

  fastify.get(
    "/admin",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["announcements"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(50),
        }),
        response: {
          200: z.object({
            banners: z.array(AnnouncementBannerResponseSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await getAdminAnnouncements(fastify.prisma, request.query);
      return reply.send(result);
    }
  );

  fastify.post(
    "/admin",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["announcements"],
        body: CreateAnnouncementBannerSchema,
        response: {
          201: AnnouncementBannerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const banner = await createAnnouncement(request.body, fastify.prisma);
      await fastify.redis.del(`announcements:${banner.type}`);
      await fastify.redis.del(`announcements:ALL`);
      return reply.status(201).send(banner);
    }
  );

  fastify.patch(
    "/admin/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["announcements"],
        params: z.object({ id: z.string().cuid() }),
        body: CreateAnnouncementBannerSchema.partial(),
        response: {
          200: AnnouncementBannerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const banner = await updateAnnouncement(request.params.id, request.body, fastify.prisma);
      await fastify.redis.del(`announcements:${banner.type}`);
      await fastify.redis.del(`announcements:ALL`);
      return reply.send(banner);
    }
  );

  fastify.delete(
    "/admin/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["announcements"],
        params: z.object({ id: z.string().cuid() }),
        response: {
          200: AnnouncementBannerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const banner = await deleteAnnouncement(request.params.id, fastify.prisma);
      await fastify.redis.del(`announcements:${banner.type}`);
      await fastify.redis.del(`announcements:ALL`);
      return reply.send(banner);
    }
  );
};
