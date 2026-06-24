"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@repo/ui/components/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface VotingRightsWidgetProps {
  memberId: string;
  streakMonths: number;
  activePollsCount: number;
}

export function VotingRightsWidget({
  memberId,
  streakMonths,
  activePollsCount,
}: VotingRightsWidgetProps) {
  const isEligible = streakMonths >= 12;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isEligible) {
      const storageKey = `voting_unlocked_notified_${memberId}`;
      if (!localStorage.getItem(storageKey)) {
        toast("🗳️ Parabéns! Você conquistou o direito de voto. Agora o Tubarão é realmente seu.", {
          duration: 5000,
        });
        localStorage.setItem(storageKey, "true");
      }
    }
  }, [isEligible, memberId]);

  if (!mounted) return null;

  if (isEligible) {
    if (activePollsCount > 0) {
      return (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-none shadow-md mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Sua voz importa 🗳️</h3>
              <p className="text-blue-100 text-sm">
                Você tem {activePollsCount} {activePollsCount === 1 ? "votação aberta" : "votações abertas"}.
              </p>
            </div>
            <Link 
              href="/polls" 
              className="bg-white text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
            >
              Votar agora
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      );
    }
    return null; // Eligible but no polls, don't show widget per spec (or show a celebration static? Spec says "Active polls showcase: when polls are open and member is eligible...". Doesn't specify empty state for eligible.)
  }

  const monthsRemaining = 12 - streakMonths;
  const progressPercent = Math.min((streakMonths / 12) * 100, 100);

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Direito de Voto</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
            Votante em {monthsRemaining} {monthsRemaining === 1 ? "mês" : "meses"}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Faltam {monthsRemaining} {monthsRemaining === 1 ? "mês" : "meses"} para seu direito de voto
        </p>
      </CardContent>
    </Card>
  );
}
