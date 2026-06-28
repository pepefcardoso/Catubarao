"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, ChevronUp, AlertCircle, FileText, Ban } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface DealCardProps {
  deal: any;
  onRefresh: () => void;
}

export function DealCard({ deal, onRefresh }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const isExpiringSoon = () => {
    if (deal.status !== "ACTIVE") return false;
    const endDate = new Date(deal.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const handleCancelDeal = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Motivo do cancelamento é obrigatório.");
      return;
    }
    try {
      setIsCancelling(true);
      await apiFetch(`/admin/deals/${deal.id}`, {
        method: "DELETE",
        body: JSON.stringify({ cancellationReason }),
      });
      toast.success("Acordo cancelado com sucesso.");
      setIsCancelDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cancelar acordo.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/admin/deals/${deal.id}/proof-report.pdf`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          toast.error("Não é possível exportar: este acordo não possui entregas comprovadas.");
        } else {
          toast.error("Erro ao gerar relatório PDF.");
        }
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `relatorio-entregas-${deal.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar relatório PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const expiring = isExpiringSoon();

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${expiring ? "border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]" : ""}`}>
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  Acordo {deal.type}
                  {expiring && (
                    <span className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Expira em breve
                    </span>
                  )}
                </h4>
                <Badge variant={deal.status === "ACTIVE" ? "default" : deal.status === "COMPLETED" ? "secondary" : "destructive"}>
                  {deal.status === "ACTIVE" ? "Ativo" : deal.status === "COMPLETED" ? "Concluído" : "Cancelado"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>Início: {format(new Date(deal.startDate), "dd/MM/yyyy")}</span>
                <span>Término: {format(new Date(deal.endDate), "dd/MM/yyyy")}</span>
                {deal.financialValue && (
                  <span>Valor: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deal.financialValue)}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {deal.status === "ACTIVE" && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Cancelar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancelar Acordo</DialogTitle>
                      <DialogDescription>
                        Esta ação não pode ser desfeita. Por favor, informe o motivo do cancelamento.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="cancellationReason">Motivo</Label>
                      <Input
                        id="cancellationReason"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Ex: Quebra de contrato"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Voltar</Button>
                      <Button variant="destructive" onClick={handleCancelDeal} disabled={isCancelling}>
                        {isCancelling ? "Cancelando..." : "Confirmar Cancelamento"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1">
                Entregas
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {deal.status === "CANCELLED" && deal.cancellationReason && (
            <div className="mt-3 p-3 bg-red-50 text-red-800 text-sm rounded-md flex items-start gap-2 dark:bg-red-950/30 dark:text-red-300 border border-red-100 dark:border-red-900/50">
              <Ban className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block">Motivo do cancelamento:</span>
                {deal.cancellationReason}
              </div>
            </div>
          )}

          {deal.notes && (
            <p className="mt-3 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <span className="font-medium text-foreground">Notas:</span> {deal.notes}
            </p>
          )}
        </div>

        {/* Expandable Deliverables Section */}
        {isExpanded && (
          <div className="border-t bg-muted/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Entregáveis ({deal.deliverables?.length || 0})
              </h5>
              <Button size="sm" variant="outline" onClick={handleExportPdf} disabled={isExportingPdf}>
                {isExportingPdf ? "Exportando..." : "Exportar Relatório PDF"}
              </Button>
            </div>
            
            {!deal.deliverables || deal.deliverables.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 bg-background rounded-md border border-dashed">
                Nenhum entregável cadastrado para este acordo.
              </p>
            ) : (
              <ul className="space-y-2">
                {deal.deliverables.map((del: any) => (
                  <li key={del.id} className="text-sm bg-background p-3 rounded-md border flex items-center justify-between">
                    <span>{del.description}</span>
                    <Badge variant="outline" className="text-xs">{del.frequency}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
