import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UpdateMemberProfileSchema, MeResponseSchema, MembershipCardResponseSchema, MemberReferralResponseSchema, PaginatedPaymentsResponseSchema, PaginatedMembersResponseSchema, ListMembersQuerySchema, AdminMemberDetailResponseSchema, UpdateAdminNoteSchema } from "@repo/schemas/member";
import { getMe, updateMe, generateMembershipCard, getMemberReferral, getMemberPayments, listMembers, getMemberAdminDetail, updateAdminNotes, exportMemberData, anonymizeMember } from "./members.service";
import { prisma } from "@repo/db";
import { z } from "zod";

export const membersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["members"],
        querystring: ListMembersQuerySchema,
        response: {
          200: PaginatedMembersResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const query = request.query;
      const result = await listMembers(query, prisma);
      return reply.status(200).send(result);
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["members"],
        response: {
          200: AdminMemberDetailResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await getMemberAdminDetail(id, prisma);
      return reply.status(200).send(result);
    }
  );

  fastify.patch(
    "/:id/admin-notes",
    {
      schema: {
        tags: ["members"],
        body: UpdateAdminNoteSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await updateAdminNotes(id, request.body.adminNotes, prisma);
      return reply.status(200).send({ success: true });
    }
  );

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
          404: z.object({ message: z.string() }),
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
          404: z.object({ message: z.string() }),
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

  fastify.get(
    "/me/referral",
    {
      schema: {
        tags: ["members"],
        response: {
          200: MemberReferralResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const referralData = await getMemberReferral(memberId, prisma);
      return reply.status(200).send(referralData);
    }
  );

  fastify.get(
    "/me/payments",
    {
      schema: {
        tags: ["members"],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(50).default(10),
        }),
        response: {
          200: PaginatedPaymentsResponseSchema,
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const { page, limit } = request.query as { page: number; limit: number };
      const payments = await getMemberPayments(memberId, page, limit, prisma);
      return reply.status(200).send(payments);
    }
  );

  fastify.get(
    "/me/export",
    {
      schema: {
        tags: ["members"],
        response: {
          200: z.any(), // Export returns a dynamic JSON structure
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const data = await exportMemberData(memberId, prisma);
      
      reply.header("Content-Disposition", `attachment; filename="member-data-${memberId}.json"`);
      reply.header("Content-Type", "application/json");
      return reply.status(200).send(data);
    }
  );

  fastify.delete(
    "/me",
    {
      schema: {
        tags: ["members"],
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const memberId = request.user.id;
      const result = await anonymizeMember(memberId, prisma);
      return reply.status(200).send(result);
    }
  );
};
