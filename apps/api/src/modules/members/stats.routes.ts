import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateGoalSchema, StatsMembersResponseSchema, GoalResponseSchema } from "@repo/schemas/stats";

export const statsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/stats/members",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: StatsMembersResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const cacheKey = "stats:members";
      const cached = await fastify.redis.get(cacheKey);

      if (cached) {
        return reply.status(200).send(JSON.parse(cached));
      }

      // Compute total and byTier
      const activeSubscriptions = await fastify.prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true },
      });

      const total = activeSubscriptions.length;
      const tierMap = new Map<string, { planId: string; planName: string; count: number }>();

      for (const sub of activeSubscriptions) {
        const existing = tierMap.get(sub.planId);
        if (existing) {
          existing.count += 1;
        } else {
          tierMap.set(sub.planId, {
            planId: sub.planId,
            planName: sub.plan.name,
            count: 1,
          });
        }
      }

      const byTier = Array.from(tierMap.values());

      // Fetch goals
      const goalsDb = await fastify.prisma.dashboardGoal.findMany({
        orderBy: { createdAt: "asc" },
      });

      const goals = goalsDb.map(g => ({
        id: g.id,
        label: g.label,
        target: g.target,
        metric: g.metric,
        createdAt: g.createdAt.toISOString(),
      }));

      const payload = { total, byTier, goals };

      // Cache for 30 seconds
      await fastify.redis.set(cacheKey, JSON.stringify(payload), "EX", 30);

      return reply.status(200).send(payload);
    }
  );

  fastify.post(
    "/admin/goals",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["admin", "stats"],
        body: CreateGoalSchema,
        response: {
          201: GoalResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { label, target, metric } = request.body;

      const goal = await fastify.prisma.dashboardGoal.create({
        data: {
          label,
          target,
          metric,
        },
      });

      // Invalidate cache when new goals are added
      await fastify.redis.del("stats:members");

      return reply.status(201).send({
        id: goal.id,
        label: goal.label,
        target: goal.target,
        metric: goal.metric,
        createdAt: goal.createdAt.toISOString(),
      });
    }
  );
};
