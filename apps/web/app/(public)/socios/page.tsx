import { Metadata } from "next";
import { LiveCounter } from "./live-counter";
import { env } from "@/lib/env";
import { StatsMembersResponse } from "@repo/schemas/stats";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sócio-Torcedor - Clube Atlético Tubarão",
    description: "Acompanhe nossos sócios em tempo real e ajude o Tubarão a bater as metas!",
  };
}

export default async function SociosPage() {
  // Fetch initial data for SSR
  let initialData: StatsMembersResponse = { total: 0, byTier: [], goals: [] };
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats/members`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      initialData = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch initial stats data", err);
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-primary">
          Sócio-Torcedor Tubarão
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Faça parte da história. Acompanhe em tempo real o nosso crescimento e ajude o Tubarão a alcançar suas metas!
        </p>

        <LiveCounter initialData={initialData} />
      </div>
    </div>
  );
}
