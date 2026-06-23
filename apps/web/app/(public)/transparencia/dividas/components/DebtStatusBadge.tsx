import { Badge } from "@repo/ui/components/badge";

export type DebtStatus = "EM_NEGOCIACAO" | "EM_DIA" | "ATRASADO" | "QUITADO";

const statusConfig: Record<DebtStatus, { label: string; className: string }> = {
  ATRASADO: { label: "Atrasado", className: "bg-red-500 hover:bg-red-600 text-white" },
  EM_NEGOCIACAO: { label: "Em Negociação", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  EM_DIA: { label: "Em Dia", className: "bg-blue-500 hover:bg-blue-600 text-white" },
  QUITADO: { label: "Quitado", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
};

interface DebtStatusBadgeProps {
  status: string;
}

export function DebtStatusBadge({ status }: DebtStatusBadgeProps) {
  const config = statusConfig[status as DebtStatus];
  
  if (!config) return <Badge variant="outline">{status}</Badge>;

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
