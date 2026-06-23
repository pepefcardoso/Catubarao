"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { CreateDeliveryProofBodySchema } from "@repo/schemas/partner";
import { Loader2, Upload } from "lucide-react";

type ProofFormValues = z.infer<typeof CreateDeliveryProofBodySchema>;

interface DeliveryProofDialogProps {
  deliverableId: string | null;
  matchEventId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeliveryProofDialog({
  deliverableId,
  matchEventId,
  open,
  onOpenChange,
  onSuccess,
}: DeliveryProofDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<ProofFormValues>({
    resolver: zodResolver(CreateDeliveryProofBodySchema),
    defaultValues: {
      deliveredAt: new Date().toISOString().split("T")[0],
      evidenceType: "FOTO",
      fileUrl: null,
      linkUrl: null,
      notes: "",
      matchEventId: matchEventId || null,
    },
  });

  const evidenceType = form.watch("evidenceType");
  const requiresFile = ["FOTO", "PRINT_POST", "NOTA"].includes(evidenceType);
  const requiresLink = evidenceType === "LINK";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const onSubmit = async (values: ProofFormValues) => {
    if (!deliverableId) return;
    
    if (requiresFile && !file) {
      toast.error("Por favor, selecione um arquivo.");
      return;
    }
    if (requiresLink && !values.linkUrl) {
      form.setError("linkUrl", { message: "Link é obrigatório para este tipo de evidência." });
      return;
    }

    try {
      setIsSubmitting(true);
      let fileUrl: string | null = null;

      // 1. Upload file if required
      if (requiresFile && file) {
        // Get presigned URL
        const uploadInfo = await apiFetch<{ uploadUrl: string; key: string }>(
          `/admin/deliverables/${deliverableId}/proof/upload-url`,
          {
            method: "POST",
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type || "application/octet-stream",
            }),
          }
        );

        // Upload directly to R2
        const uploadRes = await fetch(uploadInfo.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Falha ao fazer upload do arquivo.");
        }

        fileUrl = `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${uploadInfo.key}`;
      }

      // 2. Register proof
      await apiFetch(`/admin/deliverables/${deliverableId}/proof`, {
        method: "POST",
        body: JSON.stringify({
          ...values,
          fileUrl,
          matchEventId: matchEventId || null,
        }),
      });

      toast.success("Entrega registrada com sucesso!");
      form.reset();
      setFile(null);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao registrar entrega.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Entrega</DialogTitle>
          <DialogDescription>
            Envie a evidência para comprovar a realização desta entrega.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deliveredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Entrega</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidenceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evidência</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FOTO">Foto</SelectItem>
                      <SelectItem value="PRINT_POST">Print de Postagem</SelectItem>
                      <SelectItem value="LINK">Link / URL</SelectItem>
                      <SelectItem value="NOTA">Nota Fiscal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresFile && (
              <div className="space-y-2">
                <FormLabel>Arquivo ({evidenceType})</FormLabel>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,application/pdf"
                  />
                </div>
                {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
              </div>
            )}

            {requiresLink && (
              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Post / Notícia</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes adicionais sobre a entrega..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
