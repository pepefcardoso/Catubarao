import React from "react";
import { cn } from "@repo/ui/lib/utils";
import { ClubCrest } from "./ClubCrest";

interface MemberAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  tier?: string;
  avatarUrl?: string | null;
  className?: string;
}

const TIER_COLORS: Record<string, string> = {
  "Sócio": "bg-brand-surface text-brand-primary",
  "Sócio Prata": "bg-slate-300 text-slate-800",
  "Sócio Ouro": "bg-yellow-400 text-yellow-900",
  "Sócio Diamante": "bg-blue-200 text-blue-900",
  // Defaults mapping based on GamificationCard colors
  "brand-surface": "bg-brand-surface text-brand-primary",
  "brand-primary": "bg-brand-primary text-white",
  "brand-secondary": "bg-brand-secondary text-white",
  "brand-accent": "bg-brand-accent text-white",
};

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function MemberAvatar({ size = "md", tier, avatarUrl, className }: MemberAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const colorClass = tier && TIER_COLORS[tier] ? TIER_COLORS[tier] : "bg-primary/20 text-primary";

  if (avatarUrl) {
    return (
      <div className={cn("relative rounded-full overflow-hidden shrink-0", sizeClass, className)}>
        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-full shrink-0 flex items-center justify-center", sizeClass, colorClass, className)}>
      <ClubCrest className="w-1/2 h-1/2" />
    </div>
  );
}
