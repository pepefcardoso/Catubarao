import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductResponseSchema,
} from "@repo/schemas/store";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products.service";

export const productsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Public GET endpoints
  fastify.get(
    "/store/products",
    {
      schema: {
        tags: ["store", "products"],
        response: {
          200: z.array(ProductResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const products = await listProducts(fastify.prisma);
      return reply.send(products);
    }
  );

  fastify.get(
    "/store/products/:id",
    {
      schema: {
        tags: ["store", "products"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: ProductResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const product = await getProductById(request.params.id, fastify.prisma);
      return reply.send(product);
    }
  );

  // Admin endpoints
  fastify.post(
    "/admin/store/products",
    {
      schema: {
        tags: ["admin", "store", "products"],
        body: CreateProductSchema,
        response: {
          201: ProductResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const product = await createProduct(request.body, fastify.prisma);
      return reply.status(201).send(product);
    }
  );

  fastify.patch(
    "/admin/store/products/:id",
    {
      schema: {
        tags: ["admin", "store", "products"],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateProductSchema,
        response: {
          200: ProductResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const product = await updateProduct(request.params.id, request.body, fastify.prisma);
      return reply.send(product);
    }
  );

  fastify.delete(
    "/admin/store/products/:id",
    {
      schema: {
        tags: ["admin", "store", "products"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: ProductResponseSchema,
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const product = await deleteProduct(request.params.id, fastify.prisma);
      return reply.send(product);
    }
  );
};
