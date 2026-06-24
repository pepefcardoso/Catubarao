"use client";

import { useEffect, useState, useRef } from "react";
import { env } from "@/lib/env";
import { StatsMembersResponse } from "@repo/schemas/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { StadiumFill } from "@/components/socios/StadiumFill";

function useCountUp(end: number, durationMs: number = 1500) {
  const [count, setCount] = useState(0);
  const prevEndRef = useRef(0);

  useEffect(() => {
    const startValue = prevEndRef.current;
    if (startValue === end) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / durationMs, 1);
      
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(startValue + (end - startValue) * easeOut));

      if (progress < durationMs) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
        prevEndRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, durationMs]);

  return count;
}

interface LiveCounterProps {
  initialData: StatsMembersResponse;
}

export function LiveCounter({ initialData }: LiveCounterProps) {
  const [data, setData] = useState<StatsMembersResponse>(initialData);
  const animatedTotal = useCountUp(data.total);
  const { data: session } = useSession();
  
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats/members`);
        if (res.ok) {
          const newData = await res.json();
          setData(newData);
        }
      } catch (error) {
        console.error("Failed to fetch live stats", error);
      }
    }, 5000); // 5s interval

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data.goals || data.goals.length === 0) return;
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % data.goals.length);
    }, 4000);
    return () => clearInterval(phraseInterval);
  }, [data.goals]);

  const fillPercentage = Math.min(100, Math.max(0, (data.total / 1000) * 100));

  // Determine member number:
  const memberNumber = (session?.user as any)?.memberNumber || session?.user?.id?.substring(0, 5) || "???";

  return (
    <div className="space-y-12">
      {/* Live Counter Display */}
      <Card className="border-2 border-primary/20 shadow-xl dark:border-primary/40 dark:bg-card/50 backdrop-blur-sm overflow-hidden relative">
        <CardHeader>
          <CardTitle className="text-2xl text-muted-foreground font-medium">Sócios Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center relative z-10">
            <span className="text-7xl font-black tabular-nums tracking-tighter sm:text-9xl text-primary">
              {animatedTotal}
            </span>
            <div className="mt-4 flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Atualizado em tempo real
              </span>
            </div>

            {/* Rotating impact phrases */}
            {data.goals && data.goals.length > 0 && (
              <div className="h-8 mt-6 relative overflow-hidden flex justify-center w-full max-w-md">
                {data.goals.map((goal, idx) => (
                  <div
                    key={goal.id}
                    className={`absolute transition-opacity duration-1000 ${
                      idx === phraseIndex ? "opacity-100" : "opacity-0"
                    } text-lg text-foreground font-medium text-center w-full`}
                  >
                    {goal.label}
                  </div>
                ))}
              </div>
            )}

            {/* Your brick indicator */}
            {session && (
              <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="text-muted-foreground text-sm font-medium">
                  Você é o sócio nº {memberNumber}. Sua contribuição está aqui →
                </span>
                <div className="text-primary mt-2 animate-bounce">
                  ↓
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50">
             <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-muted-foreground">O Caldeirão está enchendo</h3>
             </div>
             <StadiumFill fill={fillPercentage} />
          </div>
        </CardContent>
      </Card>

      {/* Goals Display */}
      {data.goals && data.goals.length > 0 && (
        <div className="space-y-6 text-left">
          <h2 className="text-3xl font-bold tracking-tight">Metas da Campanha</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {data.goals.map((goal) => {
              const current = data.total;
              const percentage = Math.min(100, Math.max(0, (current / goal.target) * 100));
              const isCompleted = current >= goal.target;

              return (
                <Card key={goal.id} className={`transition-all duration-300 ${isCompleted ? 'border-primary/50 shadow-md' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{goal.label}</span>
                      {isCompleted && (
                        <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Concluída!
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Meta: {goal.target.toLocaleString('pt-BR')} {goal.metric}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{current.toLocaleString('pt-BR')}</span>
                        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-8 pb-4">
        <Link href="/plans" passHref>
          <Button size="lg" className="w-full sm:w-auto text-lg px-12 py-6 font-bold rounded-full shadow-lg hover:shadow-xl transition-all">
            Seja Sócio Agora
          </Button>
        </Link>
      </div>
    </div>
  );
}
