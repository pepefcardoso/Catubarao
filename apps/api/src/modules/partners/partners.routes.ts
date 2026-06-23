import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreatePartnerSchema,
  UpdatePartnerSchema,
  PartnerResponseSchema,
  PartnerStatusSchema,
  PartnerWithDealsResponseSchema,
} from "@repo/schemas/partner";
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from "./partners.service";

export const partnersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/admin/partners",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["partners"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(50),
          status: PartnerStatusSchema.optional(),
        }),
        response: {
          200: z.object({
            partners: z.array(PartnerResponseSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await getPartners(fastify.prisma, request.query);
      return reply.send(result);
    }
  );

  fastify.get(
    "/admin/partners/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["partners"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: PartnerWithDealsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const partner = await getPartnerById(request.params.id, fastify.prisma);
      return reply.send(partner);
    }
  );

  fastify.post(
    "/admin/partners",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["partners"],
        body: CreatePartnerSchema,
        response: {
          201: PartnerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const partner = await createPartner(request.body, fastify.prisma);
      return reply.status(201).send(partner);
    }
  );

  fastify.patch(
    "/admin/partners/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["partners"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdatePartnerSchema,
        response: {
          200: PartnerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const partner = await updatePartner(request.params.id, request.body, fastify.prisma);
      return reply.send(partner);
    }
  );

  fastify.delete(
    "/admin/partners/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["partners"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: PartnerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const partner = await deletePartner(request.params.id, fastify.prisma);
      return reply.send(partner);
    }
  );
};
