import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user?: any;
    session?: any;
  }
}

export default fp(async (fastify) => {
  fastify.all("/api/auth/*", async (request, reply) => {
    const headers = fromNodeHeaders(request.headers);
    const url = new URL(request.url, `http://${request.headers.host}`);
    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body && request.method !== "GET" ? { body: JSON.stringify(request.body) } : {}),
    });

    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body ? await response.text() : null);
  });

  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    request.user = session.user;
    request.session = session.session;
  });

  fastify.decorate("requireRole", (role: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      if (request.user.role !== role) {
        return reply.status(403).send({ message: "Forbidden" });
      }
    };
  });
}, { name: "auth" });
