"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useSession } from "@/lib/auth-client";

export function SentryProvider() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const checkConsentAndEnable = () => {
      const consent = localStorage.getItem("cookie-consent");
      if (consent === "all" || session?.user) {
        const client = Sentry.getClient();
        if (client) {
          const options = client.getOptions();
          if (options) {
            options.enabled = true;
          }
        }
      }

      // Sync consent to backend if authenticated and not yet synced
      if (session?.user && consent && !localStorage.getItem("cookie-consent-synced")) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        fetch(`${apiUrl}/consent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ choices: consent === "all" ? { all: true } : { essential: true } }),
        })
          .then((res) => {
            if (res.ok) {
              localStorage.setItem("cookie-consent-synced", "true");
            }
          })
          .catch((e) => console.error("Failed to sync consent", e));
      }
    };

    if (!isPending) {
      checkConsentAndEnable();
    }

    window.addEventListener("cookie-consent-changed", checkConsentAndEnable);
    return () => window.removeEventListener("cookie-consent-changed", checkConsentAndEnable);
  }, [session, isPending]);

  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  return null;
}
