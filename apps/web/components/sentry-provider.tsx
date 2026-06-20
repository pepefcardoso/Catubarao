"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useSession } from "@/lib/auth-client";

export function SentryProvider() {
  const { data: session } = useSession();

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
