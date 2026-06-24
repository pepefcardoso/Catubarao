import { env } from "@/lib/env";
import { CheckoutClient } from "./checkout-client";
import { redirect } from "next/navigation";
import { CheckoutTrustSidebar } from "@/components/checkout/CheckoutTrustSidebar";

export const metadata = {
  title: "Checkout | Sócio-Torcedor",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const params = await searchParams;
  const planId = params.planId;

  if (!planId) {
    redirect("/plans");
  }

  // Fetch plan details to show in checkout
  let plan = null;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/plans`, {
      cache: "no-store",
    });
    if (res.ok) {
      const plans = await res.json();
      plan = plans.find((p: any) => p.id === planId);
    }
  } catch (err) {
    console.error("Failed to fetch plan:", err);
  }

  if (!plan) {
    redirect("/plans");
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutClient plan={plan} mpPublicKey={env.NEXT_PUBLIC_MP_PUBLIC_KEY || ""} />
        </div>
        <div className="lg:col-span-1">
          <CheckoutTrustSidebar />
        </div>
      </div>
    </div>
  );
}
