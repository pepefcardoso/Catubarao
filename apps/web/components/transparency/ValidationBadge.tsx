"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { ShieldCheck } from "lucide-react";

interface ValidationBadgeProps {
  label: string;
  description?: string;
  logoUrl?: string;
}

export function ValidationBadge({ label, description, logoUrl }: ValidationBadgeProps) {
  const [imageError, setImageError] = useState(false);

  const badgeContent = (
    <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 cursor-help">
      {logoUrl && !imageError ? (
        <div className="relative size-4">
          <Image
            src={logoUrl}
            alt={label}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <ShieldCheck className="size-4 text-primary" />
      )}
      <span>{label}</span>
    </div>
  );

  if (!description) {
    // If no description, we still return the badge but remove cursor-help class
    return (
      <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors">
        {logoUrl && !imageError ? (
          <div className="relative size-4">
            <Image
              src={logoUrl}
              alt={label}
              fill
              className="object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <ShieldCheck className="size-4 text-primary" />
        )}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-center">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
