import React from "react";
import { cn } from "@repo/ui/lib/utils";

export function ClubCrest({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("w-full h-full text-current", className)} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
