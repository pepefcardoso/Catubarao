import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";
import "./lib/env";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const cspHeader = `
    default-src 'self';
    script-src 'self' https://sdk.mercadopago.com https://*.sentry.io;
    connect-src 'self' https://*.sentry.io https://api.mercadopago.com ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"} https://ws.tubarao.fc wss://ws.tubarao.fc;
    img-src 'self' data: blob: https://*.sentry.io ${process.env.R2_PUBLIC_URL || "https://assets.tubarao.fc"};
    style-src 'self' 'unsafe-inline';
    frame-src 'self' https://*.mercadopago.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
    ];
  },
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
