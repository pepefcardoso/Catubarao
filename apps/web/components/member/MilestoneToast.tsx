"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

// Must match API types
const MILESTONE_TYPES = [
  "STREAK_6M",
  "STREAK_12M",
  "STREAK_24M",
  "STREAK_36M",
  "STREAK_60M",
  "ANNIVERSARY",
];

const MILESTONE_MESSAGES: Record<string, (pts: number) => string> = {
  STREAK_6M: (pts) => `🔥 6 meses de fidelidade! +${pts} Escudos`,
  STREAK_12M: (pts) => `⭐ 1 ano de sócio! +${pts} Escudos`,
  STREAK_24M: (pts) => `🏆 2 anos de sócio! +${pts} Escudos`,
  STREAK_36M: (pts) => `🦈 3 anos de lenda! +${pts} Escudos`,
  STREAK_60M: (pts) => `🏅 5 anos de história viva! +${pts} Escudos`,
  ANNIVERSARY: (pts) => `🎂 Feliz aniversário de sócio! +${pts} Escudos`,
};

export function MilestoneToast() {
  const firedRef = useRef(false);

  useEffect(() => {
    // Only fire once per component mount session
    if (firedRef.current) return;
    
    fetch("/api/members/me/points")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch points");
        return res.json();
      })
      .then((data) => {
        if (!data.recentEvents) return;
        
        // Find events in the last 24h that are milestones
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const freshMilestones = data.recentEvents.filter((event: any) => {
          if (!MILESTONE_TYPES.includes(event.type)) return false;
          
          const eventTime = new Date(event.createdAt).getTime();
          return now - eventTime < oneDay;
        });

        for (const event of freshMilestones) {
          const storageKey = `milestone_toast_${event.type}_${event.memberId}`;
          if (localStorage.getItem(storageKey)) continue;

          // Mark as shown
          localStorage.setItem(storageKey, "1");
          firedRef.current = true;

          // Fire confetti (dual-sided)
          const duration = 3000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#00FF00', '#000000', '#FFFFFF']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#00FF00', '#000000', '#FFFFFF']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();

          // Show Toast
          const msgFn = MILESTONE_MESSAGES[event.type];
          if (msgFn) {
            toast.success(msgFn(event.points), {
              duration: 5000,
            });
          }

          // Only fire for the first fresh milestone found to avoid overlapping confetti
          break;
        }
      })
      .catch((err) => {
        console.error("Failed to fetch points for milestone check:", err);
      });
  }, []);

  return null;
}
