import { Metadata } from "next";
import { env } from "@/lib/env";
import { MonumentMember } from "@repo/schemas/member";
import { MuroHero } from "./muro-hero";
import { MuroWallClient } from "./muro-wall-client";

export const revalidate = 300; // ISR revalidation every 5 minutes

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Muro dos Fundadores — Clube Atlético Tubarão",
    description:
      "Os nomes eternizados na história do Tubarão. Conheça os sócios fundadores que estão reconstruindo o clube.",
  };
}

export default async function MuroPage() {
  let members: MonumentMember[] = [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/members/monument`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      members = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch monument members:", error);
  }

  return (
    <div className="min-h-screen bg-brand-surface relative pb-20">
      <MuroHero count={members.length} />
      <MuroWallClient initialMembers={members} />
    </div>
  );
}
