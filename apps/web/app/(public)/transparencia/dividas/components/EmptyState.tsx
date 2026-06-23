import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        <FileText className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Nenhuma dívida registrada</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Não há registros de dívidas ou passivos disponíveis no momento. Volte mais tarde para conferir as atualizações do portal de transparência.
      </p>
    </div>
  );
}
