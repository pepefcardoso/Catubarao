"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Input } from "@repo/ui/components/input";
import { Loader2, Plus, Camera, History } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { DebtRecordResponse, DebtSnapshotResponse } from "@repo/schemas/transparency";
import { DebtRecordSheet } from "./DebtRecordSheet";

const DEBT_STATUSES = ["EM_NEGOCIACAO", "EM_DIA", "ATRASADO", "QUITADO"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseCurrencyInput(value: string) {
  const numeric = value.replace(/[^0-9,-]+/g, "").replace(",", ".");
  return parseFloat(numeric) || 0;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function EditableDebtRow({ 
  debt, 
  onUpdate 
}: { 
  debt: DebtRecordResponse; 
  onUpdate: (id: string, data: any) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [paidAmount, setPaidAmount] = useState(debt.paidAmount.toString());
  const [status, setStatus] = useState(debt.status);
  const [publicNote, setPublicNote] = useState(debt.publicNote || "");

  const handleSave = async () => {
    const numPaid = parseCurrencyInput(paidAmount);
    
    // Only save if changed
    if (
      numPaid !== debt.paidAmount ||
      status !== debt.status ||
      publicNote !== (debt.publicNote || "")
    ) {
      await onUpdate(debt.id, {
        paidAmount: numPaid,
        status,
        publicNote: publicNote || null,
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setPaidAmount(debt.paidAmount.toString());
      setStatus(debt.status);
      setPublicNote(debt.publicNote || "");
      setIsEditing(false);
    }
  };

  const negotiated = debt.negotiatedAmount ?? debt.originalAmount;
  const remaining = negotiated - debt.paidAmount;

  return (
    <TableRow className="hover:bg-muted/50 transition-colors border-white/5">
      <TableCell>
        <div className="font-medium">{debt.creditorName}</div>
        {debt.creditorGroup && (
          <div className="text-xs text-muted-foreground">{debt.creditorGroup}</div>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatCurrency(debt.originalAmount)}</TableCell>
      <TableCell className="text-muted-foreground">{formatCurrency(negotiated)}</TableCell>
      <TableCell>
        <Input
          className="w-32 h-8 text-sm"
          value={paidAmount}
          onChange={(e) => {
            setPaidAmount(e.target.value);
            setIsEditing(true);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      </TableCell>
      <TableCell className="font-medium text-red-600 dark:text-red-400">
        {formatCurrency(remaining)}
      </TableCell>
      <TableCell>
        <select
          className="h-8 w-32 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring dark:bg-input/30"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setIsEditing(true);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        >
          {DEBT_STATUSES.map(s => (
            <option key={s} value={s} className="bg-background text-foreground">{s.replace("_", " ")}</option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <Input
          className="w-48 h-8 text-sm"
          placeholder="Nota pública"
          value={publicNote}
          onChange={(e) => {
            setPublicNote(e.target.value);
            setIsEditing(true);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      </TableCell>
    </TableRow>
  );
}

export function DebtAdminDashboard() {
  const [debts, setDebts] = useState<DebtRecordResponse[]>([]);
  const [snapshots, setSnapshots] = useState<DebtSnapshotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [debtsData, snapshotsData] = await Promise.all([
        apiFetch<Record<string, DebtRecordResponse[]>>("/transparency/debts"),
        apiFetch<DebtSnapshotResponse[]>("/transparency/debts/snapshots"),
      ]);
      
      const flatDebts = Object.values(debtsData).flat();
      setDebts(flatDebts);
      setSnapshots(snapshotsData.sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateRecord = async (id: string, data: any) => {
    try {
      await apiFetch(`/transparency/debts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      toast.success("Registro atualizado com sucesso");
      // Update local state to reflect change without full reload
      setDebts(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar registro");
      fetchData(); // reload to revert
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);
      const snapshot = await apiFetch<DebtSnapshotResponse>("/transparency/debts/snapshot", {
        method: "POST",
      });
      toast.success(`Snapshot criado! Saldo devedor: ${formatCurrency(snapshot.totalRemaining)}`);
      
      // Update snapshots list
      setSnapshots(prev => [snapshot, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar snapshot");
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-4">
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Credor
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleCreateSnapshot} 
          disabled={isCreatingSnapshot}
          className="gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
        >
          {isCreatingSnapshot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          Criar Snapshot Agora
        </Button>
      </div>

      <Card className="border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle>Credores e Registros</CardTitle>
          <CardDescription>
            Atualize os valores pagos, status e notas. Salva automaticamente ao sair do campo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead>Credor</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Valor Negociado</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Saldo Devedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nota Pública</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                debts.map(debt => (
                  <EditableDebtRow 
                    key={debt.id} 
                    debt={debt} 
                    onUpdate={handleUpdateRecord} 
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Histórico de Snapshots
          </CardTitle>
          <CardDescription>
            Registros consolidados no tempo. Não podem ser alterados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead>Data</TableHead>
                <TableHead>Total Original</TableHead>
                <TableHead>Total Negociado</TableHead>
                <TableHead>Total Pago</TableHead>
                <TableHead>Saldo Devedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum snapshot encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                snapshots.map(snap => (
                  <TableRow key={snap.id} className="hover:bg-muted/50 transition-colors border-white/5">
                    <TableCell className="font-medium">
                      {formatDate(snap.snapshotDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(snap.totalOriginal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(snap.totalNegotiated)}
                    </TableCell>
                    <TableCell className="text-emerald-500/80">
                      {formatCurrency(snap.totalPaid)}
                    </TableCell>
                    <TableCell className="font-bold text-red-500/80">
                      {formatCurrency(snap.totalRemaining)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DebtRecordSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSaved={fetchData}
      />
    </div>
  );
}
