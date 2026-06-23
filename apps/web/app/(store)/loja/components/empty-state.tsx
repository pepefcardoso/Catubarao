import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border border-dashed rounded-xl bg-muted/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Não conseguimos encontrar nenhum produto que corresponda aos filtros selecionados.
      </p>
      <Button asChild variant="outline">
        <Link href="/loja">Limpar filtros</Link>
      </Button>
    </div>
  );
}
