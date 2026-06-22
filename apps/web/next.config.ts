import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";
import "./lib/env";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(withSerwist(nextConfig), {
  org: "tubarao",
  project: "web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: false,
  },
  disableLogger: true,
});
