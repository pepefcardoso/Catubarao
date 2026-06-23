"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDealBodySchema, CreateDealBodyInput } from "@repo/schemas/partner";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

interface DealSheetProps {
  partnerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DealSheet({ partnerId, open, onOpenChange, onSuccess }: DealSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDealBodyInput>({
    resolver: zodResolver(CreateDealBodySchema),
    defaultValues: {
      type: "FINANCEIRO",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (open) {
      // Fetch admins when sheet opens
      apiFetch("/members?role=ADMIN&limit=100")
        .then((res: any) => {
          setAdmins(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to load admins", err);
          toast.error("Erro ao carregar administradores");
        });
    }
  }, [open]);

  const onSubmit = async (data: CreateDealBodyInput) => {
    try {
      setIsLoading(true);
      
      const payload = {
        ...data,
        financialValue: data.financialValue ? Number(data.financialValue) : undefined,
      };

      await apiFetch(`/admin/partners/${partnerId}/deals`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Acordo adicionado com sucesso!");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar acordo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Acordo</SheetTitle>
          <SheetDescription>
            Adicione um novo acordo para este parceiro.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select 
              value={watch("type")} 
              onValueChange={(val: any) => setValue("type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                <SelectItem value="PERMUTA">Permuta</SelectItem>
                <SelectItem value="MISTO">Misto</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <span className="text-sm text-red-500">{errors.type.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="financialValue">Valor Financeiro (R$)</Label>
            <Input id="financialValue" type="number" step="0.01" {...register("financialValue")} />
            {errors.financialValue && <span className="text-sm text-red-500">{errors.financialValue.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && <span className="text-sm text-red-500">{errors.startDate.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data de Término</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
            {errors.endDate && <span className="text-sm text-red-500">{errors.endDate.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">Proprietário (Admin)</Label>
            <Select 
              value={watch("ownerId")} 
              onValueChange={(val: any) => setValue("ownerId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um admin" />
              </SelectTrigger>
              <SelectContent>
                {admins.map(admin => (
                  <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ownerId && <span className="text-sm text-red-500">{errors.ownerId.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={watch("status")} 
              onValueChange={(val: any) => setValue("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <span className="text-sm text-red-500">{errors.status.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anotações (opcional)</Label>
            <Textarea id="notes" {...register("notes")} />
            {errors.notes && <span className="text-sm text-red-500">{errors.notes.message}</span>}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Acordo"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
