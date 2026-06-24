"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { env } from "@/lib/env";
import type { RecentMemberResponse } from "@repo/schemas/stats";

export function RecentJoinTicker() {
  const [members, setMembers] = useState<RecentMemberResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check sessionStorage on mount
    const dismissed = sessionStorage.getItem("hideRecentJoinTicker") === "true";
    setIsDismissed(dismissed);

    if (dismissed) return;

    const fetchMembers = async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats/members/recent`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMembers(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch recent members", err);
      }
    };

    fetchMembers();
    const interval = setInterval(fetchMembers, 60000); // 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (members.length === 0 || isDismissed) return;

    setIsVisible(true);

    if (isHovered) return;

    const timer = setInterval(() => {
      // Trigger exit animation
      setIsVisible(false);
      
      // Wait for exit animation to complete before changing index and re-entering
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % members.length);
        setIsVisible(true);
      }, 500); // 500ms for exit animation
      
    }, 8000); // 8s per member

    return () => clearInterval(timer);
  }, [members, isHovered, isDismissed]);

  if (isDismissed || members.length === 0) return null;

  const currentMember = members[currentIndex] || members[0];
  if (!currentMember) return null;

  const locationText = currentMember.city ? ` de ${currentMember.city}` : "";

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 transition-all duration-500 ease-in-out"
      style={{
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(150%) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 bg-background text-foreground shadow-xl rounded-xl px-4 py-3 border border-border/50 max-w-sm">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg">🎉</span>
        </div>
        <p className="text-sm font-medium leading-snug flex-1">
          <span className="font-semibold">{currentMember.firstName}</span>{locationText} acabou de se tornar sócio!
        </p>
        <button
          onClick={() => {
            sessionStorage.setItem("hideRecentJoinTicker", "true");
            setIsDismissed(true);
            setIsVisible(false);
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
