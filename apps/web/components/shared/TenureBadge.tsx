import React from "react";
import { cn } from "@repo/ui/lib/utils";
import { Badge } from "@repo/ui/components/badge";

export function TenureBadge({ year, className }: { year: number; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("text-xs text-muted-foreground bg-muted font-normal", className)}>
      Membro desde {year}
    </Badge>
  );
}
