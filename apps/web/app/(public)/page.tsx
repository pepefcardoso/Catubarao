import { Metadata } from "next";
import { env } from "@/lib/env";
import { HeroSection } from "@/components/home/hero-section";
import { LiveCounterSection } from "@/components/home/live-counter-section";
import { BenefitStripSection } from "@/components/home/benefit-strip-section";
import { GoalProgressSection } from "@/components/home/goal-progress-section";
import { TransparencyTeaserSection } from "@/components/home/transparency-teaser-section";
import { StoreTeaserSection } from "@/components/home/store-teaser-section";
import { CtaFooterSection } from "@/components/home/cta-footer-section";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Clube Atlético Tubarão SAF",
    description: "O Tubarão é nosso. A reconstrução é agora. Seja sócio-torcedor.",
  };
}

async function getStats() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats/members`, { next: { revalidate: 60 } });
    if (!res.ok) return { total: 0, byTier: [], goals: [] };
    return res.json();
  } catch (error) {
    console.error("Failed to fetch stats", error);
    return { total: 0, byTier: [], goals: [] };
  }
}

async function getLatestTransparencyPost() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/transparency/posts?limit=1`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.posts && data.posts.length > 0 ? data.posts[0] : null;
  } catch (error) {
    console.error("Failed to fetch transparency post", error);
    return null;
  }
}

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/store/products?isFeatured=true&limit=3`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch products", error);
    return [];
  }
}

export default async function PublicPage() {
  const [stats, latestPost, products] = await Promise.all([
    getStats(),
    getLatestTransparencyPost(),
    getFeaturedProducts()
  ]);

  return (
    <main className="flex flex-col min-h-screen w-full">
      <HeroSection />
      <LiveCounterSection initialData={stats} />
      <BenefitStripSection />
      <GoalProgressSection initialData={stats} />
      <TransparencyTeaserSection latestPost={latestPost} />
      <StoreTeaserSection products={products} />
      <CtaFooterSection initialData={stats} />
    </main>
  );
}
