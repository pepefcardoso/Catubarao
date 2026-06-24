"use client";

import { useEffect, useState } from "react";
import { getTier, getProgressToNextTier, GAMIFICATION_EMOJIS } from "../../lib/gamification";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GamificationData {
  total: number;
  rank: number | null;
  recentEvents: Array<{
    type: string;
    points: number;
    createdAt: string;
    metadata?: Record<string, any>;
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    isUnlocked: boolean;
  }>;
}

export function GamificationCard() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/members/me/points")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch points");
        return res.json();
      })
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) return <div>Carregando...</div>;

  const currentTier = getTier(data.total);
  const { pct, remaining, nextTier } = getProgressToNextTier(data.total);

  const badgeColorMap: Record<string, string> = {
    "brand-surface": "bg-brand-surface",
    "brand-primary": "bg-brand-primary",
    "brand-secondary": "bg-brand-secondary",
    "brand-accent": "bg-brand-accent",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Programa de Escudos</span>
          <Badge className={`${badgeColorMap[currentTier.color] || 'bg-brand-primary'} text-white`}>{currentTier.name}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>{data.total} Escudos</span>
            {nextTier && (
              <span className="text-muted-foreground">
                Faltam {remaining} Escudos para {nextTier.name}
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Leaderboard Teaser */}
        {data.rank !== null && (
          <div className="text-sm">
            Você está em <Link href="/leaderboard" className="font-bold underline text-brand-primary">#{data.rank}</Link> no ranking
          </div>
        )}

        {/* Badges Showcase */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Suas Conquistas</h4>
          <div className="grid grid-cols-4 gap-2">
            {data.badges.map((badge: GamificationData['badges'][0]) => (
              <div 
                key={badge.id}
                className={`flex flex-col items-center p-2 rounded-lg border text-center ${badge.isUnlocked ? 'border-brand-primary bg-brand-surface' : 'grayscale opacity-50 border-border'}`}
                title={badge.isUnlocked ? badge.description : `Complete para desbloquear: ${badge.description}`}
              >
                <div className="text-2xl mb-1">🏅</div>
                <span className="text-[10px] leading-tight font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Atividade Recente</h4>
          <div className="overflow-y-auto h-[150px] pr-2">
            <div className="space-y-3">
              {data.recentEvents.map((event: GamificationData['recentEvents'][0], i: number) => {
                const emoji = GAMIFICATION_EMOJIS[event.type] || "✨";
                const date = formatDistanceToNow(new Date(event.createdAt), { addSuffix: true, locale: ptBR });
                
                let title = 'Bônus Especial';
                if (event.type === 'CHECKIN') {
                  title = event.metadata?.opponent ? `Check-in vs. ${event.metadata.opponent}` : 'Check-in no jogo';
                } else if (event.type === 'REFERRAL') {
                  title = 'Indicação de sócio';
                } else if (event.type === 'STREAK_12M') {
                  title = 'Sócio Fiel 12M';
                } else if (event.type === 'STREAK_6M') {
                  title = 'Sócio Fiel 6M';
                } else if (event.type === 'ANNIVERSARY') {
                  title = 'Aniversário';
                }

                return (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span>{title}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-brand-primary">+{event.points} Escudos</span>
                      <span className="text-[10px] text-muted-foreground">{date}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
