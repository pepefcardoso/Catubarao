"use client";

import { useEffect, useState } from "react";
import { env } from "@/lib/env";
import { StatsMembersResponse } from "@repo/schemas/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

interface LiveCounterProps {
  initialData: StatsMembersResponse;
}

export function LiveCounter({ initialData }: LiveCounterProps) {
  const [data, setData] = useState<StatsMembersResponse>(initialData);

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

  return (
    <div className="space-y-12">
      {/* Live Counter Display */}
      <Card className="border-2 border-primary/20 shadow-xl dark:border-primary/40 dark:bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-muted-foreground font-medium">Sócios Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center">
            <span className="text-7xl font-black tabular-nums tracking-tighter sm:text-9xl text-primary">
              {data.total}
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
