"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAnnouncementBannerSchema, CreateAnnouncementBannerInput, AnnouncementBannerResponse } from "@repo/schemas/banner";
import { apiFetch } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";

interface BannerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: AnnouncementBannerResponse | null;
  onSaved: () => void;
}

type FormValues = {
  type: "ANNOUNCEMENT" | "BADGE" | "MILESTONE";
  text: string;
  link?: string | null;
  color: string;
  isActive: boolean;
  expiresAt?: string | null;
};

export function BannerSheet({ open, onOpenChange, banner, onSaved }: BannerSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateAnnouncementBannerSchema) as any,
    defaultValues: {
      type: "ANNOUNCEMENT",
      text: "",
      link: "",
      color: "brand-primary",
      isActive: true,
      expiresAt: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (banner) {
        form.reset({
          type: banner.type,
          text: banner.text,
          link: banner.link || "",
          color: banner.color,
          isActive: banner.isActive,
          expiresAt: banner.expiresAt ? new Date(banner.expiresAt).toISOString().slice(0, 10) : null,
        });
      } else {
        form.reset({
          type: "ANNOUNCEMENT",
          text: "",
          link: "",
          color: "brand-primary",
          isActive: true,
          expiresAt: null,
        });
      }
    }
  }, [open, banner, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      };
      
      if (banner) {
        await apiFetch(`/announcements/admin/${banner.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Anúncio atualizado com sucesso!");
      } else {
        await apiFetch("/announcements/admin", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Anúncio criado com sucesso!");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(banner ? "Erro ao atualizar anúncio" : "Erro ao criar anúncio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full border-white/10 bg-background/95 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{banner ? "Editar Anúncio" : "Novo Anúncio"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ANNOUNCEMENT">Anúncio (Global)</SelectItem>
                      <SelectItem value="BADGE">Selo de Transparência</SelectItem>
                      <SelectItem value="MILESTONE">Marco Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Nova campanha de sócios aberta!" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (Opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="brand-primary">Primária (Tubarão)</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                      <SelectItem value="amber">Laranja</SelectItem>
                      <SelectItem value="emerald">Verde</SelectItem>
                      <SelectItem value="#111111">Preto Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Expiração (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value ? String(field.value).slice(0, 10) : ""} 
                      onChange={(e) => field.onChange(e.target.value || null)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-background/50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {banner ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
