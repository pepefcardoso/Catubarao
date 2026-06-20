import fp from "fastify-plugin";
import { Queue, Worker, DefaultJobOptions } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { sendEmailJob } from "../jobs/send-email";
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

export default fp(async (fastify) => {
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
    new Worker(
      "payments",
      async (job) => {
        fastify.log.info({ jobId: job.id }, "Processing payments job");
      },
      { connection }
    ),
    new Worker(
      "email",
      sendEmailJob,
      { connection }
    ),
    new Worker(
      "notifications",
      async (job) => {
        fastify.log.info({ jobId: job.id }, "Processing notifications job");
      },
      { connection }
    ),
    new Worker(
      "scheduled",
      async (job) => {
        fastify.log.info({ jobId: job.id }, "Processing scheduled job");
      },
      { connection }
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

  fastify.register(async (app) => {
    app.addHook("preHandler", app.authenticate);
    app.addHook("preHandler", app.requireRole("ADMIN"));
    app.register(serverAdapter.registerPlugin(), { prefix: "/" });
  }, { prefix: "/admin/queues" });

  fastify.addHook("onClose", async () => {
    await Promise.all(workers.map((w) => w.close()));
    await Promise.all(Object.values(queues).map((q) => q.close()));
  });
}, {
  name: "queues",
  dependencies: ["auth"],
});
