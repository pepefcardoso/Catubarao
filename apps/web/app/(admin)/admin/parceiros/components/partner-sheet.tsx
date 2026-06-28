import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreatePartnerSchema, CreatePartnerInput } from "@repo/schemas/partner";
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

interface PartnerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PartnerSheet({ open, onOpenChange, onSuccess }: PartnerSheetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePartnerInput>({
    resolver: zodResolver(CreatePartnerSchema),
    defaultValues: {
      status: "PROSPECT",
    },
  });

  const onSubmit = async (data: CreatePartnerInput) => {
    try {
      setIsLoading(true);
      await apiFetch("/admin/partners", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Parceiro adicionado com sucesso!");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar parceiro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Parceiro</SheetTitle>
          <SheetDescription>
            Adicione um novo parceiro ao CRM.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="legalName">Razão Social</Label>
            <Input id="legalName" {...register("legalName")} />
            {errors.legalName && <span className="text-sm text-red-500">{errors.legalName.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradeName">Nome Fantasia</Label>
            <Input id="tradeName" {...register("tradeName")} />
            {errors.tradeName && <span className="text-sm text-red-500">{errors.tradeName.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ (14 dígitos, opcional)</Label>
            <Input id="cnpj" {...register("cnpj")} />
            {errors.cnpj && <span className="text-sm text-red-500">{errors.cnpj.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input id="segment" {...register("segment")} />
            {errors.segment && <span className="text-sm text-red-500">{errors.segment.message}</span>}
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
                <SelectItem value="PROSPECT">Prospecto</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <span className="text-sm text-red-500">{errors.status.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nome do Contato</Label>
            <Input id="contactName" {...register("contactName")} />
            {errors.contactName && <span className="text-sm text-red-500">{errors.contactName.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email do Contato</Label>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
            {errors.contactEmail && <span className="text-sm text-red-500">{errors.contactEmail.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefone do Contato</Label>
            <Input id="contactPhone" {...register("contactPhone")} />
            {errors.contactPhone && <span className="text-sm text-red-500">{errors.contactPhone.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anotações (opcional)</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Parceiro"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
