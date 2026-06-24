import { Lock, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import { env } from "@/lib/env";

export async function CheckoutTrustSidebar() {
  let activeMembersCount = 0;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats/members`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      activeMembersCount = data.total || 0;
    }
  } catch (err) {
    console.error("Failed to fetch member stats for sidebar:", err);
  }

  return (
    <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <Lock className="w-6 h-6 text-green-600 shrink-0" />
        <span className="text-sm font-medium">Pagamento 100% seguro via Mercado Pago</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <RefreshCcw className="w-6 h-6 text-blue-600 shrink-0" />
        <span className="text-sm font-medium">Cancele a qualquer momento, sem multa</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0" />
        <span className="text-sm font-medium">Seus dados são protegidos pela LGPD</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Users className="w-6 h-6 text-brand-primary shrink-0" />
        <span className="text-sm font-medium">Junte-se a +{activeMembersCount} sócios ativos</span>
      </div>

      <div className="pt-4 border-t flex justify-center">
        <Image 
          src="/mercado-pago.svg" 
          alt="Mercado Pago" 
          width={120} 
          height={32}
          className="opacity-80"
        />
      </div>
    </div>
  );
}
