export type Tier = {
  name: string;
  min: number;
  max: number;
  color: string;
};

export const TIERS: readonly Tier[] = [
  { name: "Torcedor", min: 0,    max: 99,   color: "brand-surface" },
  { name: "Camisa 10", min: 100, max: 499,  color: "brand-primary" },
  { name: "Ídolo",    min: 500,  max: 999,  color: "brand-secondary" },
  { name: "Lenda",    min: 1000, max: Infinity, color: "brand-accent" },
] as const;

export function getTier(points: number): Tier {
  return TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
}

export function getProgressToNextTier(points: number): { pct: number; remaining: number, nextTier: Tier | null } {
  const currentTierIndex = TIERS.findIndex(t => points >= t.min && points <= t.max);
  if (currentTierIndex === -1 || currentTierIndex === TIERS.length - 1) {
    return { pct: 100, remaining: 0, nextTier: null };
  }
  
  const currentTier = TIERS[currentTierIndex];
  const nextTier = TIERS[currentTierIndex + 1];
  
  const tierRange = nextTier.min - currentTier.min;
  const pointsInTier = points - currentTier.min;
  const pct = Math.min(100, Math.max(0, (pointsInTier / tierRange) * 100));
  const remaining = nextTier.min - points;
  
  return { pct, remaining, nextTier };
}

export const GAMIFICATION_EMOJIS: Record<string, string> = {
  CHECKIN: "🏟️",
  REFERRAL: "🤝",
  ANNIVERSARY: "🎂",
  STREAK_6M: "🔥",
  STREAK_12M: "⭐"
};
