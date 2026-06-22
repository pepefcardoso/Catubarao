import type { FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@repo/db";
import type { RegisterMemberInput, LoginInput } from "@repo/schemas";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth";
import { ConflictError, ValidationError } from "../../lib/errors";
import crypto from "crypto";

export async function registerMember(
  request: FastifyRequest<{ Body: RegisterMemberInput }>,
  reply: FastifyReply,
  db: PrismaClient,
) {
  const input = request.body;

  // Check CPF uniqueness
  if (input.cpf) {
    const existing = await db.member.findUnique({ where: { cpf: input.cpf } });
    if (existing) {
      throw new ConflictError("CPF already registered");
    }
  }

  // Check referral code
  let referredById = undefined;
  if (input.referralCode) {
    const referrer = await db.member.findUnique({ where: { referralCode: input.referralCode } });
    if (!referrer) {
      throw new ValidationError("Invalid referral code");
    }
    referredById = referrer.id;
  }

  // Generate unique referral code for the new member
  const newReferralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  let response;
  try {
    response = await auth.api.signUpEmail({
      headers: fromNodeHeaders(request.headers),
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        cpf: input.cpf,
        phone: input.phone,
        birthDate: input.birthDate,
        referralCode: newReferralCode,
        referredById,
        marketingConsent: input.marketingConsent,
        whatsappOptIn: input.whatsappOptIn,
        isActive: true,
      },
      asResponse: true,
    });
  } catch (err) {
    console.error("BETTER AUTH SIGNUP ERROR:", err);
    throw err;
  }

  const finalStatus = response.status === 200 ? 201 : response.status;
  reply.status(finalStatus);
  response.headers.forEach((value, key) => reply.header(key, value));
  return reply.send(response.body ? await response.text() : null);
}

export async function loginMember(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const input = request.body;

  const response = await auth.api.signInEmail({
    headers: fromNodeHeaders(request.headers),
    body: {
      email: input.email,
      password: input.password,
    },
    asResponse: true,
  });

  reply.status(response.status);
  response.headers.forEach((value, key) => reply.header(key, value));
  return reply.send(response.body ? await response.text() : null);
}

export async function logoutMember(request: FastifyRequest, reply: FastifyReply) {
  const response = await auth.api.signOut({
    headers: fromNodeHeaders(request.headers),
    asResponse: true,
  });

  reply.status(response.status);
  response.headers.forEach((value, key) => reply.header(key, value));
  return reply.send(response.body ? await response.text() : null);
}

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return reply.status(401).send({ error: "UnauthorizedError" });
  }

  // Better Auth automatically handles session extension (sliding window) when getSession is called.
  return reply.send({ success: true, session });
}
