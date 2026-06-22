import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UpdateMemberProfileSchema, MeResponseSchema, MembershipCardResponseSchema } from "@repo/schemas/member";
import { getMe, updateMe, generateMembershipCard } from "./members.service";
import { prisma } from "@repo/db";

export const membersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/me",
    {
      schema: {
        tags: ["members"],
        response: {
          200: MeResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const me = await getMe(memberId, prisma);
      return reply.status(200).send(me);
    },
  );

  fastify.patch(
    "/me",
    {
      schema: {
        tags: ["members"],
        body: UpdateMemberProfileSchema,
        response: {
          200: MeResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      await updateMe(memberId, request.body, prisma);
      // Fetch the updated profile with adimplencia calculation
      const me = await getMe(memberId, prisma);
      return reply.status(200).send(me);
    },
  );

  fastify.get(
    "/me/card",
    {
      schema: {
        tags: ["members"],
        response: {
          200: MembershipCardResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      
      const card = await prisma.membershipCard.findFirst({
        where: { 
          memberId, 
          isActive: true,
          subscription: {
            status: {
              not: "SUSPENDED"
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!card) {
        return reply.status(404).send({ message: "Card not found or suspended" });
      }

      return reply.status(200).send(card);
    }
  );

  fastify.post(
    "/:id/card/rotate",
    {
      schema: {
        tags: ["members"],
        response: {
          200: MembershipCardResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      
      const card = await prisma.membershipCard.findFirst({
        where: { memberId: id, isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      if (!card) {
        return reply.status(404).send({ message: "No active card to rotate" });
      }

      const newCard = await generateMembershipCard(id, card.subscriptionId, prisma);
      return reply.status(200).send(newCard);
    }
  );
};
