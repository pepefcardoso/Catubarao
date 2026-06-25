import * as Sentry from "@sentry/node";
// import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "./lib/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || "development",
    // integrations: [nodeProfilingIntegration()],
    tracesSampler: (samplingContext) => {
      // Set up transaction tracing for specific critical endpoints
      const name = samplingContext.name || samplingContext.transactionContext?.name;
      if (
        name?.includes("POST /webhooks/mercadopago") ||
        name?.includes("POST /store/orders")
      ) {
        return 1.0; // 100% trace rate for these endpoints
      }
      return 0.1; // 10% trace rate for everything else
    },
    profilesSampleRate: 1.0,
  });
}
