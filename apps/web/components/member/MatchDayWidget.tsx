"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import type { UpcomingEventResponse } from "@repo/schemas/events";

export function MatchDayWidget() {
  const [data, setData] = useState<UpcomingEventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/events/upcoming")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  if (error || !data || !data.state || !data.event) {
    return null; // Empty state: widget hidden
  }

  const { state, event, baseCheckinPoints, memberCheckin, checkinStreak } = data;
  const eventDate = new Date(event.date);

  return (
    <Card className="bg-gradient-to-br from-brand-surface to-background border-brand-primary/20 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {state === "PREMATCH" && "🏟️ Próximo Jogo"}
            {state === "MATCHDAY" && "⚡ É Hoje!"}
            {state === "POSTMATCH" && "🏟️ Pós-Jogo"}
          </CardTitle>
          {checkinStreak > 0 && (state === "PREMATCH" || state === "POSTMATCH") && (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Flame className="w-3 h-3 mr-1" />
              {checkinStreak} jogos seguidos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {state === "PREMATCH" && (
          <PreMatchView event={event} eventDate={eventDate} points={baseCheckinPoints} />
        )}
        {state === "MATCHDAY" && (
          <MatchDayView event={event} />
        )}
        {state === "POSTMATCH" && (
          <PostMatchView event={event} checkin={memberCheckin} />
        )}
      </CardContent>
    </Card>
  );
}

function PreMatchView({ event, eventDate, points }: { event: any; eventDate: Date; points: number }) {
  const [timeLeft, setTimeLeft] = useState(computeCountdown(eventDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(computeCountdown(eventDate)), 60_000);
    return () => clearInterval(id);
  }, [eventDate]);

  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xl font-bold">Tubarão vs. {event.opponent}</p>
        <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
      </div>
      
      <div className="bg-brand-surface/50 p-3 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Contagem Regressiva</p>
          <p className="text-xs text-muted-foreground">Faltam {timeLeft}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Não esqueça o check-in para ganhar <span className="font-semibold text-brand-primary">{points} Escudos</span>.
      </p>
    </div>
  );
}

function MatchDayView({ event }: { event: any }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xl font-bold">Tubarão vs. {event.opponent}</p>
        <p className="text-sm text-muted-foreground">{event.competition}</p>
      </div>
      
      <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground font-semibold">
        <Link href="/card">
          Faça seu check-in agora!
          <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}

function PostMatchView({ event, checkin }: { event: any; checkin: { points: number } | null }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xl font-bold">Tubarão vs. {event.opponent}</p>
      </div>
      
      {checkin ? (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-green-700 dark:text-green-400">
          <p className="font-medium flex items-center">
            <span className="text-xl mr-2">🏟️</span> Você esteve lá!
          </p>
          <p className="text-sm mt-1">+{checkin.points} Escudos conquistados.</p>
        </div>
      ) : (
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-medium">Perdeu o check-in?</p>
          <p className="text-sm text-muted-foreground mt-1">Não perca o próximo e mantenha sua sequência!</p>
        </div>
      )}
    </div>
  );
}

function computeCountdown(targetDate: Date) {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return "0 horas";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? "s" : ""} e ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  }
  
  return `${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
}
