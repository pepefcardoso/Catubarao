import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateWaitlistEntrySchema, WaitlistEntrySchema, WaitlistListResponseSchema } from "@repo/schemas/waitlist";
import { addWaitlistEntry, getWaitlist } from "./waitlist.service";

export const waitlistRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/waitlist",
    {
      schema: {
        tags: ["waitlist"],
        body: CreateWaitlistEntrySchema,
        response: {
          200: WaitlistEntrySchema,
          201: WaitlistEntrySchema,
        },
      },
    },
    async (request, reply) => {
      // We check if it exists in service and return early if so.
      // If it's a new entry, we could theoretically return 201.
      // For simplicity, we just use the service and send 201 or 200 depending on creation.
      
      const existing = await fastify.prisma.waitlist.findUnique({
        where: { email: request.body.email }
      });

      const entry = await addWaitlistEntry(request.body, fastify.prisma);
      
      return reply.status(existing ? 200 : 201).send(entry);
    }
  );

  fastify.get(
    "/admin/waitlist",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["admin", "waitlist"],
        response: {
          200: WaitlistListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const list = await getWaitlist(fastify.prisma);
      return reply.status(200).send(list);
    }
  );
};
