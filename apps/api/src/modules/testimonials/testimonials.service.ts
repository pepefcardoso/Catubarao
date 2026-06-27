import type { PrismaClient } from "@repo/db";
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "@repo/schemas/testimonial";
import { NotFoundError } from "../../lib/errors";

export async function getApprovedTestimonials(db: PrismaClient) {
  return db.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminTestimonials(db: PrismaClient) {
  return db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createTestimonial(input: CreateTestimonialInput, db: PrismaClient) {
  return db.testimonial.create({
    data: input,
  });
}

export async function updateTestimonial(
  id: string,
  input: UpdateTestimonialInput,
  db: PrismaClient
) {
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) {
    throw new NotFoundError("Testimonial not found");
  }

  return db.testimonial.update({
    where: { id },
    data: input,
  });
}

export async function deleteTestimonial(id: string, db: PrismaClient) {
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) {
    throw new NotFoundError("Testimonial not found");
  }

  return db.testimonial.delete({
    where: { id },
  });
}
