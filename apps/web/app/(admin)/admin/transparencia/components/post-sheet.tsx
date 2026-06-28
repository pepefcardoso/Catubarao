"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CreateTransparencyPostSchema, 
  type CreateTransparencyPostInput,
  type TransparencyPostResponse
} from "@repo/schemas/transparency";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { apiFetch } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

interface PostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: TransparencyPostResponse | null;
  onSaved: () => void;
}

export function PostSheet({ open, onOpenChange, post, onSaved }: PostSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateTransparencyPostInput>({
    resolver: zodResolver(CreateTransparencyPostSchema),
    defaultValues: {
      title: post?.title || "",
      category: post?.category || "BALANCO_MENSAL",
      referenceMonth: post?.referenceMonth || undefined,
      referenceYear: post?.referenceYear || undefined,
      body: post?.body || "",
      attachmentUrl: post?.attachmentUrl || undefined,
      publishedAt: post?.publishedAt || new Date().toISOString(),
      scheduledFor: post?.scheduledFor || undefined,
    },
  });

  const category = form.watch("category");
  const needsMonthYear = category === "BALANCO_MENSAL" || category === "STATUS_DIVIDAS";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const tempId = crypto.randomUUID();
      
      const { uploadUrl, attachmentUrl } = await apiFetch<{uploadUrl: string, attachmentUrl: string}>("/transparency/posts/upload-url", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          entityId: tempId,
        }),
      });

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Upload to R2 failed");

      form.setValue("attachmentUrl", attachmentUrl);
      toast.success("Arquivo enviado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: CreateTransparencyPostInput) => {
    startTransition(async () => {
      try {
        if (post) {
          await apiFetch(`/transparency/posts/${post.id}`, {
            method: "PUT",
            body: JSON.stringify(data),
          });
          toast.success("Publicação atualizada com sucesso!");
        } else {
          await apiFetch("/transparency/posts", {
            method: "POST",
            body: JSON.stringify(data),
          });
          toast.success("Publicação criada com sucesso!");
        }
        onSaved();
        onOpenChange(false);
        form.reset();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar publicação");
      }
    });
  };

  const scheduledForVal = form.watch("scheduledFor");
  // Convert ISO string to format suitable for datetime-local
  const formattedScheduledFor = scheduledForVal ? new Date(scheduledForVal).toISOString().slice(0, 16) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl">
        <SheetHeader className="space-y-1 mb-8">
          <SheetTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {post ? "Editar Publicação" : "Nova Publicação"}
          </SheetTitle>
          <SheetDescription>
            {post ? "Atualize as informações da publicação." : "Crie uma nova publicação para o Portal de Transparência."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Balanço de Janeiro 2025" {...field} className="bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="BALANCO_MENSAL">Balanço Mensal</option>
                      <option value="STATUS_DIVIDAS">Status de Dívidas</option>
                      <option value="ATA_ASSEMBLEIA">Ata de Assembleia</option>
                      <option value="COMPOSICAO_SOCIETARIA">Composição Societária</option>
                      <option value="DOCUMENTO_SAF">Documento SAF</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {needsMonthYear && (
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="referenceMonth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Mês de Referência</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="bg-background/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referenceYear"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Ano de Referência</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2000}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="bg-background/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agendar para (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={formattedScheduledFor}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(isNaN(date.getTime()) ? undefined : date.toISOString());
                      }}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachmentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento PDF (Opcional)</FormLabel>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="relative overflow-hidden group bg-background/50 hover:bg-muted/50 transition-colors"
                      disabled={isUploading}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Upload PDF"
                      />
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4 mr-2 group-hover:-translate-y-1 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{isUploading ? "Enviando..." : "Selecionar Arquivo"}</span>
                    </Button>
                    {field.value && (
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        {field.value.split("/").pop()}
                      </span>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="flex flex-col flex-1 h-[400px]">
                  <FormLabel>Conteúdo (Markdown)</FormLabel>
                  <Tabs defaultValue="write" className="flex-1 flex flex-col">
                    <TabsList className="self-start bg-muted/50 p-1">
                      <TabsTrigger value="write" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Escrever</TabsTrigger>
                      <TabsTrigger value="preview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Visualizar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="flex-1 mt-2">
                      <FormControl>
                        <textarea
                          placeholder="Escreva o conteúdo em markdown aqui..."
                          className="flex h-full w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                    </TabsContent>
                    <TabsContent value="preview" className="flex-1 mt-2">
                      <div className="h-full w-full rounded-md border border-input bg-background/50 px-3 py-4 text-sm min-h-[300px] overflow-y-auto prose prose-sm dark:prose-invert">
                        {field.value ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {field.value}
                          </ReactMarkdown>
                        ) : (
                          <span className="text-muted-foreground italic">O modo de visualização aparecerá aqui...</span>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-6 pb-8 border-t border-border/40">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="mr-3">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all">
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {post ? "Salvar Versão" : "Criar Publicação"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
