import { Job } from "bullmq";
import { PrismaClient } from "@repo/db";
import { FastifyInstance } from "fastify";

const db = new PrismaClient();

export async function checkExpiringDealsJob(job: Job, fastify: FastifyInstance) {
  fastify.log.info("Running check-expiring-deals job");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  const activeDeals = await db.sponsorshipDeal.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: today,
        lte: maxDate,
      },
    },
    include: {
      partner: true,
      owner: true,
      deliverables: true,
      alerts: true,
    },
  });

  for (const deal of activeDeals) {
    const diffTime = deal.endDate.getTime() - today.getTime();
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let alertType: string | null = null;
    if (daysUntilExpiration <= 7) {
      alertType = "D_7";
    } else if (daysUntilExpiration <= 15) {
      alertType = "D_15";
    } else if (daysUntilExpiration <= 30) {
      alertType = "D_30";
    }

    if (!alertType) continue;

    const alreadySent = deal.alerts.some((a) => a.type === alertType);
    if (!alreadySent) {
      await fastify.queues.email.add("send-email", {
        template: "DealExpirationEmail",
        to: deal.owner.email,
        subject: `Aviso de Expiração: Contrato com ${deal.partner.tradeName}`,
        props: {
          partnerName: deal.partner.tradeName,
          dealId: deal.id,
          endDate: deal.endDate.toISOString(),
          daysRemaining: daysUntilExpiration,
          deliverables: deal.deliverables.map((d) => ({
            id: d.id,
            description: d.description,
            frequency: d.frequency,
          })),
        },
      });

      await db.dealAlert.create({
        data: {
          dealId: deal.id,
          type: alertType,
        },
      });

      fastify.log.info(
        { dealId: deal.id, alertType },
        "Enqueued DealExpirationEmail"
      );
    }
  }

  fastify.log.info("Finished check-expiring-deals job");
}
