import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateDealBodySchema,
  UpdateSponsorshipDealSchema,
  CancelDealSchema,
  SponsorshipDealResponseSchema,
  SponsorshipDealWithPartnerResponseSchema,
} from "@repo/schemas/partner";
import {
  getDealsByPartner,
  createDeal,
  updateDeal,
  cancelDeal,
  getExpiringDeals,
} from "./deals.service";

export const dealsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/admin/partners/:partnerId/deals",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["deals"],
        params: z.object({ partnerId: z.string().uuid() }),
        response: {
          200: z.array(SponsorshipDealResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const deals = await getDealsByPartner(request.params.partnerId, fastify.prisma);
      return reply.send(deals);
    }
  );

  fastify.post(
    "/admin/partners/:partnerId/deals",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["deals"],
        params: z.object({ partnerId: z.string().uuid() }),
        body: CreateDealBodySchema,
        response: {
          201: SponsorshipDealResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deal = await createDeal(request.params.partnerId, request.body, fastify.prisma);
      return reply.status(201).send(deal);
    }
  );

  fastify.patch(
    "/admin/deals/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["deals"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateSponsorshipDealSchema,
        response: {
          200: SponsorshipDealResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deal = await updateDeal(request.params.id, request.body, fastify.prisma);
      return reply.send(deal);
    }
  );

  fastify.delete(
    "/admin/deals/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["deals"],
        params: z.object({ id: z.string().uuid() }),
        body: CancelDealSchema,
        response: {
          200: SponsorshipDealResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deal = await cancelDeal(request.params.id, request.body, fastify.prisma);
      return reply.send(deal);
    }
  );

  fastify.get(
    "/admin/deals",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["deals"],
        querystring: z.object({
          expiringWithinDays: z.coerce.number().optional(),
        }),
        response: {
          200: z.array(SponsorshipDealWithPartnerResponseSchema), 
        },
      },
    },
    async (request, reply) => {
      if (request.query.expiringWithinDays !== undefined) {
        const deals = await getExpiringDeals(request.query.expiringWithinDays, fastify.prisma);
        return reply.send(deals);
      }
      return reply.send([]);
    }
  );
};
