"use client";

import { Shield } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/tooltip";

export function ImmutabilityBadge({ publishedAt }: { publishedAt: string | Date }) {
  const date = new Date(publishedAt);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
  const formattedTime = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(date);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-block w-fit">
            <Badge variant="outline" className="gap-1 mt-2 mb-4 w-fit text-xs cursor-default hover:bg-emerald-50/50 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
              <Shield className="h-3 w-3" />
              Publicado em {formattedDate} às {formattedTime} — não pode ser alterado
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          Este documento foi registrado e não pode ser modificado. Versões anteriores são preservadas e acessíveis.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
