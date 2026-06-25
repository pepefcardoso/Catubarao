import React from "react";
import { cn } from "@repo/ui/lib/utils";
import { Badge } from "@repo/ui/components/badge";

export function FounderBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn("text-xs bg-amber-100 text-amber-800 border-amber-200 font-semibold", className)}>
      Fundador 🏆
    </Badge>
  );
}
