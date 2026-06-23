import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { 
  CreateDeliverableSchema, 
  CreateDeliverableBodySchema, 
  UpdateDeliverableSchema, 
  DeliverableResponseSchema, 
  PendingDeliveryWithDetailsResponseSchema,
  GenerateProofUploadUrlSchema,
  UploadUrlResponseSchema,
  CreateDeliveryProofBodySchema,
  DeliveryProofResponseSchema,
  DeliveryProofWithDetailsResponseSchema
} from "@repo/schemas/partner";
import { 
  createDeliverable, 
  updateDeliverable, 
  getPendingDeliveries,
  getCompletedDeliveries,
  generateProofUploadUrl,
  createDeliveryProof
} from "./deliverables.service";
import { z } from "zod";

export const deliverablesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/admin/deals/:dealId/deliverables",
    {
      schema: {
        tags: ["partners"],
        params: z.object({ dealId: z.string().uuid() }),
        body: CreateDeliverableBodySchema,
        response: {
          201: DeliverableResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const deliverable = await createDeliverable(request.params.dealId, request.body, fastify.prisma);
      return reply.status(201).send(deliverable);
    },
  );

  fastify.patch(
    "/admin/deliverables/:id",
    {
      schema: {
        tags: ["partners"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateDeliverableSchema,
        response: {
          200: DeliverableResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const deliverable = await updateDeliverable(request.params.id, request.body, fastify.prisma);
      return reply.status(200).send(deliverable);
    },
  );

  fastify.get(
    "/admin/deliverables/pending",
    {
      schema: {
        tags: ["partners"],
        response: {
          200: z.array(PendingDeliveryWithDetailsResponseSchema),
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const pending = await getPendingDeliveries(fastify.prisma);
      return reply.status(200).send(pending);
    },
  );

  fastify.get(
    "/admin/deliverables/completed",
    {
      schema: {
        tags: ["partners"],
        response: {
          200: z.array(DeliveryProofWithDetailsResponseSchema),
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const completed = await getCompletedDeliveries(fastify.prisma);
      return reply.status(200).send(completed);
    },
  );

  fastify.post(
    "/admin/deliverables/:id/proof/upload-url",
    {
      schema: {
        tags: ["partners"],
        params: z.object({ id: z.string().uuid() }),
        body: GenerateProofUploadUrlSchema,
        response: {
          200: UploadUrlResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const result = await generateProofUploadUrl(request.params.id, request.body, fastify.prisma);
      return reply.status(200).send(result);
    },
  );

  fastify.post(
    "/admin/deliverables/:id/proof",
    {
      schema: {
        tags: ["partners"],
        params: z.object({ id: z.string().uuid() }),
        body: CreateDeliveryProofBodySchema,
        response: {
          201: DeliveryProofResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const proof = await createDeliveryProof(request.params.id, request.user.id, request.body, fastify.prisma);
      return reply.status(201).send(proof);
    },
  );
};
