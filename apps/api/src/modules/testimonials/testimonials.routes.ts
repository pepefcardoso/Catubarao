import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CreateTestimonialSchema,
  UpdateTestimonialSchema,
  TestimonialResponseSchema,
} from "@repo/schemas/testimonial";
import {
  getApprovedTestimonials,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "./testimonials.service";

export const testimonialsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["testimonials"],
        response: {
          200: z.array(TestimonialResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const cacheKey = "testimonials:approved";
      
      const cached = await fastify.redis.get(cacheKey);
      if (cached) {
        return reply.type("application/json").send(JSON.parse(cached));
      }

      const testimonials = await getApprovedTestimonials(fastify.prisma);
      await fastify.redis.setex(cacheKey, 300, JSON.stringify(testimonials));

      return reply.send(testimonials);
    }
  );

  fastify.get(
    "/admin",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["testimonials"],
        response: {
          200: z.array(TestimonialResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const testimonials = await getAdminTestimonials(fastify.prisma);
      return reply.send(testimonials);
    }
  );

  fastify.post(
    "/admin",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["testimonials"],
        body: CreateTestimonialSchema,
        response: {
          201: TestimonialResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const testimonial = await createTestimonial(request.body, fastify.prisma);
      if (testimonial.isApproved) {
        await fastify.redis.del("testimonials:approved");
      }
      return reply.status(201).send(testimonial);
    }
  );

  fastify.patch(
    "/admin/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["testimonials"],
        params: z.object({ id: z.string() }),
        body: UpdateTestimonialSchema,
        response: {
          200: TestimonialResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const testimonial = await updateTestimonial(request.params.id, request.body, fastify.prisma);
      
      // Invalidate cache since status might have changed, or text might have changed
      await fastify.redis.del("testimonials:approved");
      
      return reply.send(testimonial);
    }
  );

  fastify.delete(
    "/admin/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole("ADMIN")],
      schema: {
        tags: ["testimonials"],
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      await deleteTestimonial(request.params.id, fastify.prisma);
      await fastify.redis.del("testimonials:approved");
      return reply.status(204).send(null);
    }
  );
};
