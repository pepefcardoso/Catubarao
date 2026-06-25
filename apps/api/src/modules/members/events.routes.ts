import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CheckinBodySchema, BulkCheckinBodySchema } from "@repo/schemas/gamification";
import { CreateMatchEventSchema, MatchEventResponseSchema, PaginatedMatchEventsResponseSchema, UpcomingEventResponseSchema } from "@repo/schemas/events";
import { verifyCardToken } from "../../lib/qr";
import { recordGamificationEvent } from "./gamification.service";
import { createMatchEvent, listMatchEvents, getUpcomingEventForMember } from "./events.service";
import { UnauthorizedError } from "../../lib/errors";
import { z } from "zod";

export const eventsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/admin/events",
    {
      schema: {
        tags: ["events", "admin"],
        body: CreateMatchEventSchema,
        response: {
          201: MatchEventResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const event = await createMatchEvent(request.body, fastify.prisma);
      return reply.status(201).send(event);
    }
  );

  fastify.get(
    "/admin/events",
    {
      schema: {
        tags: ["events", "admin"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(20),
        }),
        response: {
          200: PaginatedMatchEventsResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const { page, limit } = request.query;
      const result = await listMatchEvents(page, limit, fastify.prisma);
      return reply.send(result);
    }
  );

  fastify.get(
    "/upcoming",
    {
      schema: {
        tags: ["events"],
        response: { 200: UpcomingEventResponseSchema },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const result = await getUpcomingEventForMember(request.user.id, fastify.prisma);
      return reply.send(result);
    }
  );

  fastify.post(
    "/events/:eventId/checkin",
    {
      schema: {
        tags: ["events", "gamification"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        body: CheckinBodySchema,
        response: {
          200: z.object({
            message: z.string(),
            event: z.any(),
            totalPoints: z.number(),
            breakdown: z.array(z.any()),
          }),
          401: z.any(),
          404: z.any(),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { token } = request.body;

      try {
        const matchEvent = await fastify.prisma.matchEvent.findUnique({
          where: { id: eventId },
        });

        if (!matchEvent) {
          return reply.status(404).send({ message: "Match event not found" } as any);
        }

        // Verify token (jwtVerify throws if expired or invalid)
        const result = await verifyCardToken(token);
        const payload = result.payload as any;

        if (!payload || !payload.memberId) {
          throw new UnauthorizedError("Invalid QR token payload");
        }

        const idempotencyKey = `CHECKIN_${payload.memberId}_${eventId}`;
        
        const gamificationEvent = await recordGamificationEvent(
          payload.memberId,
          "CHECKIN",
          fastify.prisma,
          { eventId },
          idempotencyKey
        );

        const pointsData = await import("./gamification.service.js").then(m => m.getMemberPoints(payload.memberId, fastify.prisma));

        return reply.status(200).send({
          message: "Check-in successful",
          event: gamificationEvent,
          totalPoints: pointsData.totalPoints,
          breakdown: pointsData.breakdown,
        });

      } catch (err: any) {
        if (err instanceof UnauthorizedError) throw err;
        
        // Log the internal error (e.g. signature error) but return generic 401
        fastify.log.error(err);
        throw new UnauthorizedError("Invalid or expired QR token");
      }
    }
  );
  fastify.post(
    "/events/:eventId/checkin-bulk",
    {
      schema: {
        tags: ["events", "gamification"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        body: BulkCheckinBodySchema,
        response: {
          200: z.object({
            message: z.string(),
            processed: z.number(),
            failed: z.number(),
          }),
          404: z.any(),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { checkins } = request.body;
      
      const matchEvent = await fastify.prisma.matchEvent.findUnique({
        where: { id: eventId },
      });

      if (!matchEvent) {
        return reply.status(404).send({ message: "Match event not found" } as any);
      }

      let processed = 0;
      let failed = 0;

      for (const checkin of checkins) {
        try {
          // Verify token (jwtVerify throws if expired or invalid)
          const result = await verifyCardToken(checkin.token);
          const payload = result.payload as any;

          if (!payload || !payload.memberId) {
            failed++;
            continue;
          }

          const idempotencyKey = `CHECKIN_${payload.memberId}_${eventId}`;
          
          await recordGamificationEvent(
            payload.memberId,
            "CHECKIN",
            fastify.prisma,
            { eventId, offlineTimestamp: checkin.timestamp },
            idempotencyKey
          );
          processed++;
        } catch (err: any) {
          fastify.log.warn(`Bulk checkin failed for token: ${err.message}`);
          failed++;
        }
      }

      return reply.status(200).send({
        message: "Bulk check-in processed",
        processed,
        failed,
      });
    }
  );
};
