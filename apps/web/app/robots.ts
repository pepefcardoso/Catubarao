import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://catubarao.com.br";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/member"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
