import type { Job } from "bullmq";
import { prisma } from "@repo/db";

export async function cancelAbandonedOrderJob(job: Job) {
  const { orderId } = job.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) return;

  if (order.status === "AGUARDANDO_PAGAMENTO") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELADO" }
    });
  }
}
