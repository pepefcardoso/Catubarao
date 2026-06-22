import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { MercadoPagoWebhookSchema } from "@repo/schemas/webhooks";
import { verifyMercadoPagoSignature } from "./signature";

export const mercadopagoRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/mercadopago",
    {
      // No fastify-raw-body installed, so we rely on parsed body for signature algorithm
      schema: {
        tags: ["webhooks"],
        body: MercadoPagoWebhookSchema,
        response: {
          200: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      // 1. verify signature — reject immediately if invalid
      const rawBody = JSON.stringify(request.body); // mp signature only extracts data.id, so this is safe
      const isValid = verifyMercadoPagoSignature(
        rawBody,
        request.headers["x-signature"],
        request.headers["x-request-id"],
      );
      
      if (!isValid) {
        return reply.status(401).send();
      }

      // 2. enqueue — do not process here
      await fastify.queues.payments.add("process-payment-event", {
        type: request.body.type,
        data: request.body.data,
        receivedAt: new Date().toISOString(),
      });

      // 3. respond immediately
      return reply.status(200).send();
    },
  );
};
