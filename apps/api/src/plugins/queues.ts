import fp from "fastify-plugin";
import { Queue, Worker, DefaultJobOptions } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { sendEmailJob } from "../jobs/send-email";
import { processPaymentEventJob } from "../jobs/process-payment-event";
import { processDelinquencyJob } from "../jobs/process-delinquency";
import { closePollJob } from "../jobs/close-poll";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { env } from "../lib/env";

declare module "fastify" {
  interface FastifyInstance {
    queues: {
      payments: Queue;
      email: Queue;
      notifications: Queue;
      scheduled: Queue;
    };
  }
}

export default fp(
  async (fastify) => {
    const connection = {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    };

    const defaultJobOptions: DefaultJobOptions = {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    };

    const queues = {
      payments: new Queue("payments", { connection, defaultJobOptions }),
      email: new Queue("email", { connection, defaultJobOptions }),
      notifications: new Queue("notifications", { connection, defaultJobOptions }),
      scheduled: new Queue("scheduled", { connection, defaultJobOptions }),
    };

    fastify.decorate("queues", queues);

    // Worker stubs
    const workers = [
      new Worker("payments", processPaymentEventJob, { connection }),
      new Worker("email", sendEmailJob, { connection }),
      new Worker(
        "notifications",
        async (job) => {
          fastify.log.info({ jobId: job.id }, "Processing notifications job");
        },
        { connection },
      ),
      new Worker(
        "scheduled",
        async (job) => {
          if (job.name === "process-delinquency") return processDelinquencyJob(job);
          if (job.name === "close-poll") return closePollJob(job);
          if (job.name === "send-poll-open-emails") {
            const { sendPollOpenEmailsJob } = await import("../jobs/send-poll-open-emails.js");
            return sendPollOpenEmailsJob(job);
          }
          if (job.name === "increment-streak") {
            const { incrementStreakJob } = await import("../jobs/increment-streak.js");
            return incrementStreakJob(job);
          }
          if (job.name === "create-debt-snapshot") {
            const { createDebtSnapshotJob } = await import("../jobs/create-debt-snapshot.js");
            return createDebtSnapshotJob(job, fastify.log);
          }
          if (job.name === "publish-scheduled-post") {
            const { publishScheduledPostJob } = await import("../jobs/publish-scheduled-post.js");
            return publishScheduledPostJob(job);
          }
          if (job.name === "check-expiring-deals") {
            const { checkExpiringDealsJob } = await import("../jobs/check-expiring-deals.js");
            return checkExpiringDealsJob(job, fastify);
          }
        },
        { connection },
      ),
    ];

    // Bull Board
    const serverAdapter = new FastifyAdapter();
    serverAdapter.setBasePath("/admin/queues");

    createBullBoard({
      queues: [
        new BullMQAdapter(queues.payments),
        new BullMQAdapter(queues.email),
        new BullMQAdapter(queues.notifications),
        new BullMQAdapter(queues.scheduled),
      ],
      serverAdapter,
    });

    fastify.register(
      async (app) => {
        app.addHook("preHandler", app.authenticate);
        app.addHook("preHandler", app.requireRole("ADMIN"));
        app.register(serverAdapter.registerPlugin(), { prefix: "/" });
      },
      { prefix: "/admin/queues" },
    );

    fastify.addHook("onClose", async () => {
      await Promise.all(workers.map((w) => w.close()));
      await Promise.all(Object.values(queues).map((q) => q.close()));
    });

    fastify.addHook("onReady", async () => {
      await queues.scheduled.add(
        "process-delinquency",
        {},
        {
          repeat: {
            pattern: "0 8 * * *",
            tz: "America/Sao_Paulo",
          },
          jobId: "process-delinquency-job",
        }
      );

      await queues.scheduled.add(
        "increment-streak",
        {},
        {
          repeat: {
            pattern: "0 4 1 * *",
            tz: "America/Sao_Paulo",
          },
          jobId: "increment-streak-job",
        }
      );

      await queues.scheduled.add(
        "create-debt-snapshot",
        {},
        {
          repeat: {
            pattern: "0 10 1 * *",
          },
          jobId: "create-debt-snapshot-job",
        }
      );

      await queues.scheduled.add(
        "check-expiring-deals",
        {},
        {
          repeat: {
            pattern: "0 9 * * *",
            tz: "America/Sao_Paulo",
          },
          jobId: "check-expiring-deals-job",
        }
      );
    });
  },
  {
    name: "queues",
    dependencies: ["auth"],
  },
);
