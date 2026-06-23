"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDebtRecordSchema, CreateDebtRecordInput } from "@repo/schemas/transparency";
import { apiFetch } from "@/lib/api";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DebtRecordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const DEBT_STATUSES = ["EM_NEGOCIACAO", "EM_DIA", "ATRASADO", "QUITADO"];

export function DebtRecordSheet({ open, onOpenChange, onSaved }: DebtRecordSheetProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDebtRecordInput>({
    resolver: zodResolver(CreateDebtRecordSchema),
    defaultValues: {
      status: "EM_NEGOCIACAO",
      paidAmount: 0,
    },
  });

  const onSubmit = async (data: CreateDebtRecordInput) => {
    try {
      setIsSaving(true);
      await apiFetch("/transparency/debts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Credor salvo com sucesso!");
      reset();
      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar credor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10">
        <SheetHeader>
          <SheetTitle>Novo Credor</SheetTitle>
          <SheetDescription>
            Adicione uma nova dívida ao passivo do clube.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Credor *</label>
            <Input {...register("creditorName")} placeholder="Ex: João da Silva" />
            {errors.creditorName && (
              <p className="text-xs text-red-500">{errors.creditorName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grupo do Credor</label>
            <Input {...register("creditorGroup")} placeholder="Ex: Trabalhista, Fornecedor" />
            {errors.creditorGroup && (
              <p className="text-xs text-red-500">{errors.creditorGroup.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Original *</label>
              <Input
                type="number"
                step="0.01"
                {...register("originalAmount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.originalAmount && (
                <p className="text-xs text-red-500">{errors.originalAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Negociado</label>
              <Input
                type="number"
                step="0.01"
                {...register("negotiatedAmount", { valueAsNumber: true, setValueAs: v => v === "" ? undefined : parseFloat(v) })}
                placeholder="0.00"
              />
              {errors.negotiatedAmount && (
                <p className="text-xs text-red-500">{errors.negotiatedAmount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Pago</label>
              <Input
                type="number"
                step="0.01"
                {...register("paidAmount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.paidAmount && (
                <p className="text-xs text-red-500">{errors.paidAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <select
                {...register("status")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring dark:bg-input/30"
              >
                {DEBT_STATUSES.map(s => (
                  <option key={s} value={s} className="bg-background text-foreground">
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nota Pública</label>
            <Input {...register("publicNote")} placeholder="Detalhes opcionais..." />
            {errors.publicNote && (
              <p className="text-xs text-red-500">{errors.publicNote.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Credor
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
