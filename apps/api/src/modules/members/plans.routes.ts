import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  CreateMembershipPlanSchema,
  UpdateMembershipPlanSchema,
  MembershipPlanResponseSchema,
} from "@repo/schemas/member";
import { getActivePlans, getAllPlans, createPlan, updatePlan, deletePlan } from "./plans.service";
import { prisma } from "@repo/db";
import { z } from "zod";

export const plansRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Public route
  fastify.get(
    "/plans",
    {
      schema: {
        tags: ["plans"],
        response: {
          200: z.array(MembershipPlanResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const plans = await getActivePlans(prisma);
      return reply.status(200).send(plans);
    },
  );

  // Admin routes
  fastify.get(
    "/admin/plans",
    {
      schema: {
        tags: ["plans"],
        response: {
          200: z.array(MembershipPlanResponseSchema),
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const plans = await getAllPlans(prisma);
      return reply.status(200).send(plans);
    },
  );

  fastify.post(
    "/admin/plans",
    {
      schema: {
        tags: ["plans"],
        body: CreateMembershipPlanSchema,
        response: {
          201: MembershipPlanResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const plan = await createPlan(request.body, prisma);
      return reply.status(201).send(plan);
    },
  );

  fastify.patch(
    "/admin/plans/:id",
    {
      schema: {
        tags: ["plans"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateMembershipPlanSchema,
        response: {
          200: MembershipPlanResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const plan = await updatePlan(request.params.id, request.body, prisma);
      return reply.status(200).send(plan);
    },
  );

  fastify.delete(
    "/admin/plans/:id",
    {
      schema: {
        tags: ["plans"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      await deletePlan(request.params.id, prisma);
      return reply.status(204).send(null);
    },
  );
};
