import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface MonumentCTAProps {
  isMember: boolean;
  onOptIn?: () => void;
  isPending?: boolean;
}

export function MonumentCTA({ isMember, onOptIn, isPending = false }: MonumentCTAProps) {
  return (
    <div className="sticky bottom-0 left-0 w-full bg-brand-surface/90 backdrop-blur-md border-t border-brand-primary/20 p-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm font-medium text-muted-foreground text-center sm:text-left">
          {isMember
            ? "Você já é sócio, mas seu nome não está no muro."
            : "Seja sócio para estar no Muro dos Fundadores."}
        </p>
        
        {isMember ? (
          <Button
            onClick={onOptIn}
            disabled={isPending}
            className="w-full sm:w-auto"
            variant="default"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Quero fazer parte do muro
          </Button>
        ) : (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/signup">
              Quero ser Sócio-Torcedor
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
