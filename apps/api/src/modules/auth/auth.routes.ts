import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { RegisterMemberSchema, LoginSchema } from "@repo/schemas";
import { registerMember, loginMember, logoutMember, refreshToken } from "./auth.service";
import { prisma } from "@repo/db";

export const authRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/register",
    {
      schema: {
        tags: ["auth"],
        body: RegisterMemberSchema,
      },
    },
    async (request, reply) => {
      return registerMember(request as any, reply, prisma);
    },
  );

  fastify.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        body: LoginSchema,
      },
    },
    async (request, reply) => {
      return loginMember(request as any, reply);
    },
  );

  fastify.post(
    "/logout",
    {
      schema: {
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      return logoutMember(request, reply);
    },
  );

  fastify.post(
    "/refresh",
    {
      schema: {
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      return refreshToken(request, reply);
    },
  );
};
