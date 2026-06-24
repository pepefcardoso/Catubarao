import { env } from "@/lib/env";
import { PlansClient } from "./plans-client";
import { MembershipPlanResponseSchema } from "@repo/schemas/member";
import { ExitIntentModal } from "@/components/shared/ExitIntentModal";

export const metadata = {
  title: "Planos | Sócio-Torcedor",
  description: "Escolha o melhor plano para você.",
};

export default async function PlansPage() {
  // Fetch plans from the API
  let plans: any[] = [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/plans`, {
      cache: "no-store",
    });
    if (res.ok) {
      plans = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch plans:", err);
  }

  return (
    <div className="py-8">
      <PlansClient initialPlans={plans} />
      <ExitIntentModal />
    </div>
  );
}
