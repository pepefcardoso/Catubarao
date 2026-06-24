import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductResponseSchema,
  CreateStockNotificationSchema,
} from "@repo/schemas/store";
import {
  listProducts,
  listAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products.service";
import { env } from "../../lib/env";
import { getUploadUrl, buildStorageKey } from "../../lib/storage";

export const productsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // Public GET endpoints
  fastify.get(
    "/store/products",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
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
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 60 * 1000,
        },
      },
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

  fastify.post(
    "/store/products/notify-stock",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: 60 * 1000,
        },
      },
      schema: {
        tags: ["store", "products"],
        body: CreateStockNotificationSchema,
        response: {
          201: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      const { email, variantId } = request.body;
      
      const variant = await fastify.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        return reply.status(404).send({ success: false });
      }

      await fastify.prisma.stockNotification.create({
        data: {
          email,
          variantId,
        },
      });

      return reply.status(201).send({ success: true });
    }
  );

  // Admin endpoints
  fastify.get(
    "/admin/store/products",
    {
      schema: {
        tags: ["admin", "store", "products"],
        response: {
          200: z.array(ProductResponseSchema),
        },
      },
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
    },
    async (request, reply) => {
      const products = await listAdminProducts(fastify.prisma);
      return reply.send(products);
    }
  );

  fastify.post(
    "/admin/store/products/upload-url",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["admin", "store", "products"],
        body: z.object({
          filename: z.string().min(1),
          contentType: z.string().min(1),
          entityId: z.string().min(1),
        }),
        response: {
          200: z.object({
            uploadUrl: z.string().url(),
            attachmentUrl: z.string().url(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { filename, contentType, entityId } = request.body;
      const key = buildStorageKey("store/products", entityId, filename);
      const uploadUrl = await getUploadUrl(key, contentType);
      const attachmentUrl = `${env.R2_PUBLIC_URL}/${key}`;
      return reply.send({ uploadUrl, attachmentUrl });
    }
  );

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
