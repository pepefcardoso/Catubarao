import type { PrismaClient } from "@repo/db";
import { NotFoundError, ConflictError } from "../../lib/errors";
import type { CreateMembershipPlanInput, UpdateMembershipPlanInput } from "@repo/schemas/member";

export async function getActivePlans(db: PrismaClient) {
  return db.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
}

export async function getAllPlans(db: PrismaClient) {
  return db.membershipPlan.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createPlan(data: CreateMembershipPlanInput, db: PrismaClient) {
  return db.membershipPlan.create({
    data,
  });
}

export async function updatePlan(id: string, data: UpdateMembershipPlanInput, db: PrismaClient) {
  const plan = await db.membershipPlan.findUnique({ where: { id } });
  if (!plan) {
    throw new NotFoundError("Plan not found");
  }

  if (data.isActive === false && plan.isActive === true) {
    const activeSubs = await db.subscription.count({
      where: { planId: id, status: "ACTIVE" },
    });
    if (activeSubs > 0) {
      throw new ConflictError("Cannot deactivate a plan with active subscribers");
    }
  }

  return db.membershipPlan.update({
    where: { id },
    data,
  });
}

export async function deletePlan(id: string, db: PrismaClient) {
  const plan = await db.membershipPlan.findUnique({
    where: { id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
  });

  if (!plan) {
    throw new NotFoundError("Plan not found");
  }

  if (plan.subscriptions.length > 0) {
    throw new ConflictError("Cannot delete a plan with active subscribers");
  }

  return db.membershipPlan.update({
    where: { id },
    data: { isActive: false },
  });
}
