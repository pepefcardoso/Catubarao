"use client";

import { useEffect, useState } from "react";
import { env } from "@/lib/env";
import { StatsMembersResponse } from "@repo/schemas/stats";

interface MemberCounterWidgetProps {
  initialData: StatsMembersResponse;
}

export function MemberCounterWidget({ initialData }: MemberCounterWidgetProps) {
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
    }, 30000); // 30s interval as per spec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="flex items-baseline space-x-2">
        <span className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter text-brand-primary">
          {data.total}
        </span>
        <span className="text-xl md:text-2xl font-medium text-muted-foreground">
          sócios
        </span>
      </div>
      <div className="flex items-center space-x-2 bg-secondary/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Ao vivo
        </span>
      </div>
    </div>
  );
}
