import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateOrderSchema, UpdateOrderStatusSchema, OrderResponseSchema } from "@repo/schemas/store";
import { createOrder, updateOrderStatus, getOrderHistory, getOrderById } from "./orders.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";

export const ordersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/",
    {
      schema: {
        tags: ["store"],
        body: CreateOrderSchema,
        response: {
          201: z.object({
            orderId: z.string().uuid(),
            checkoutUrl: z.string().url().optional(),
            preferenceId: z.string().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers as any),
      });

      const memberId = session?.user?.id;

      const result = await createOrder(request.body, memberId, fastify.prisma, fastify.queues);
      return reply.status(201).send(result);
    },
  );

  fastify.get(
    "/history",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["store"],
        response: {
          200: z.array(OrderResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const orders = await getOrderHistory(request.user!.id, fastify.prisma);
      return reply.status(200).send(orders as any);
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["store"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: OrderResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const order = await getOrderById(id, fastify.prisma);
      return reply.status(200).send(order as any);
    },
  );

  fastify.patch(
    "/:id/status",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["store", "admin"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateOrderStatusSchema,
        response: {
          200: z.any(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const updatedOrder = await updateOrderStatus(id, request.body as any, fastify.prisma, fastify.queues);
      return reply.status(200).send(updatedOrder);
    },
  );
};

