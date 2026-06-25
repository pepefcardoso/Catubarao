"use client";

import { useEffect, useState } from "react";
import { AlertCircle, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

interface DelinquencyBannerProps {
  status: string;
  daysSincePeriodEnd: number | null;
  activePlanId: string | null;
}

export function DelinquencyBanner({ status, daysSincePeriodEnd, activePlanId }: DelinquencyBannerProps) {
  const searchParams = useSearchParams();
  const [isReactivated, setIsReactivated] = useState(false);

  useEffect(() => {
    if (searchParams.get("reactivated") === "true") {
      setIsReactivated(true);
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#2563eb", "#ffffff"]
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#2563eb", "#ffffff"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [searchParams]);

  if (status === "ACTIVE") {
    if (isReactivated) {
      return (
        <div className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <h3 className="font-bold">Que bom ter você de volta!</h3>
            <p className="text-sm">Sua assinatura foi reativada com sucesso.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const days = daysSincePeriodEnd || 0;

  if (days >= 1 && days <= 14) {
    const countdown = 30 - days;
    return (
      <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between mb-6" aria-live="polite" aria-atomic="true">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-900">Aviso</h3>
            <p className="text-sm">
              Sua assinatura vence em {countdown} dias. Regularize para manter seus benefícios.
            </p>
          </div>
        </div>
        <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0" asChild>
          <Link href={`/checkout?planId=${activePlanId}&reactivate=true`}>
            Regularizar
          </Link>
        </Button>
      </div>
    );
  }

  if (days >= 15 && days <= 29) {
    const countdown = 30 - days;
    return (
      <div className="bg-orange-100 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between mb-6" aria-live="polite" aria-atomic="true">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 shrink-0" />
          <div>
            <h3 className="font-bold text-orange-900">Aviso Urgente</h3>
            <p className="text-sm">
              Último aviso — sua carteirinha será desativada em {countdown} dias.
            </p>
          </div>
        </div>
        <Button variant="default" className="bg-orange-600 hover:bg-orange-700 text-white shrink-0" asChild>
          <Link href={`/checkout?planId=${activePlanId}&reactivate=true`}>
            Regularizar
          </Link>
        </Button>
      </div>
    );
  }

  if (days >= 30 || status === "SUSPENDED") {
    return (
      <div className="bg-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-6" aria-live="polite" aria-atomic="true">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">Assinatura Suspensa</h3>
            <ul className="text-sm space-y-1 mt-2 text-red-700 font-medium">
              <li>✗ Carteirinha desativada</li>
              <li>✗ Desconto na loja revogado</li>
              <li>✗ Voto em assembleias bloqueado</li>
            </ul>
          </div>
        </div>
        <Button variant="destructive" className="shrink-0 self-start sm:self-center" asChild>
          <Link href={`/checkout?planId=${activePlanId}&reactivate=true`}>
            Regularize agora
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between mb-6" aria-live="polite" aria-atomic="true">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
        <div>
          <h3 className="font-bold text-yellow-900">Pagamento Pendente</h3>
          <p className="text-sm">Regularize para manter seus benefícios.</p>
        </div>
      </div>
      <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0" asChild>
        <Link href={`/checkout?planId=${activePlanId}&reactivate=true`}>
          Regularizar
        </Link>
      </Button>
    </div>
  );
}
