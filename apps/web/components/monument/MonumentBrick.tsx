import { cn } from "@repo/ui/lib/utils";

// TODO: replace with plan.accentColor when DATA-001 ships
const TIER_COLORS: Record<string, string> = {
  Prata: "border-zinc-400/40",
  Ouro: "border-yellow-400/40",
  Platina: "border-slate-300/40",
  Diamante: "border-cyan-300/40",
};

function getBrickAccent(tier: string): string {
  return TIER_COLORS[tier] ?? "border-brand-primary/20";
}

interface MonumentBrickProps {
  firstName: string;
  lastInitial: string;
  tier: string;
  animationDelay?: string;
  isHighlighted?: boolean;
  isOptimistic?: boolean;
}

export function MonumentBrick({
  firstName,
  lastInitial,
  tier,
  animationDelay = "0ms",
  isHighlighted = false,
  isOptimistic = false,
}: MonumentBrickProps) {
  const nameDisplay = lastInitial ? `${firstName} ${lastInitial}.` : firstName;
  const accentClass = getBrickAccent(tier);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded p-2 text-center text-xs font-medium bg-brand-surface border",
        accentClass,
        isHighlighted && "ring-2 ring-brand-secondary",
        isOptimistic && "opacity-50",
        // The opacity-0 is essential for the fill-mode forwards to work.
        // It makes sure items are hidden before their delay expires.
        "opacity-0 animate-[brickIn_0.4s_ease-out_forwards]",
      )}
      style={{ animationDelay }}
      title={isHighlighted ? "Seu nome está aqui 🧱" : undefined}
    >
      <span className="line-clamp-2">{nameDisplay}</span>
    </div>
  );
}
