import * as Sentry from "@sentry/node";
import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "./errors";

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (
    error instanceof ValidationError ||
    error instanceof ConflictError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError
  ) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
  }

  // Handle Zod validation errors from fastify-type-provider-zod
  if (error.code === "FST_ERR_VALIDATION") {
    return reply.status(422).send({
      error: "ValidationError",
      message: error.message,
      details: error.validation,
    });
  }

  request.log.error(error);
  Sentry.captureException(error);

  return reply.status(500).send({
    error: "InternalServerError",
    message: "An unexpected error occurred.",
  });
}
