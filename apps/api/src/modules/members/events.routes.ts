import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CheckinBodySchema } from "@repo/schemas/gamification";
import { verifyCardToken } from "../../lib/qr";
import { recordGamificationEvent } from "./gamification.service";
import { UnauthorizedError } from "../../lib/errors";
import { z } from "zod";

export const eventsRoutes: FastifyPluginAsyncZod = async (fastify) => {
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
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { token } = request.body;

      try {
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

        const pointsData = await import("./gamification.service").then(m => m.getMemberPoints(payload.memberId, fastify.prisma));

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
};
