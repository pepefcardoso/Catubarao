import { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import { TransparencyPostResponse } from "@repo/schemas/transparency";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://catubarao.com.br";

  const routes = [
    "",
    "/socios",
    "/signup",
    "/transparencia",
    "/transparencia/documentos",
    "/transparencia/dividas",
    "/transparencia/posts",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const res = await apiFetch<{ posts: TransparencyPostResponse[] }>(
      `${env.NEXT_PUBLIC_API_URL}/transparency/posts?limit=1000`
    );
    
    if (res && res.posts) {
      const postRoutes = res.posts.map((post) => ({
        url: `${baseUrl}/transparencia/posts/${post.id}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
      return [...routes, ...postRoutes];
    }
  } catch (error) {
    console.error("Failed to fetch posts for sitemap", error);
  }

  return routes;
}
