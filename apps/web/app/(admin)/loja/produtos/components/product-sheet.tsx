"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CreateProductSchema, 
  type CreateProductInput,
  type ProductResponse
} from "@repo/schemas/store";
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
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductResponse | null;
  onSaved: () => void;
}

export function ProductSheet({ open, onOpenChange, product, onSaved }: ProductSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      category: product?.category || "",
      images: product?.images || [],
      basePrice: product?.basePrice || 0,
      stockType: product?.stockType || "SOB_DEMANDA",
      membersOnly: product?.membersOnly || false,
      isActive: product?.isActive ?? true,
      variants: product?.variants?.map(v => ({
        sku: v.sku,
        size: v.size || undefined,
        color: v.color || undefined,
        priceAdjustment: v.priceAdjustment,
        stockQuantity: v.stockQuantity ?? undefined,
        stockAlertThreshold: v.stockAlertThreshold ?? undefined,
        initialStockQuantity: v.initialStockQuantity ?? undefined,
      })) || [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const stockType = form.watch("stockType");
  const images = form.watch("images");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const tempId = product?.id || crypto.randomUUID();
      
      const { uploadUrl, attachmentUrl } = await apiFetch<{uploadUrl: string, attachmentUrl: string}>("/admin/store/products/upload-url", {
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

      form.setValue("images", [...images, attachmentUrl]);
      toast.success("Imagem enviada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };

  const onSubmit = (data: CreateProductInput) => {
    startTransition(async () => {
      try {
        if (product) {
          await apiFetch(`/admin/store/products/${product.id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          toast.success("Produto atualizado com sucesso!");
        } else {
          await apiFetch("/admin/store/products", {
            method: "POST",
            body: JSON.stringify(data),
          });
          toast.success("Produto criado com sucesso!");
        }
        onSaved();
        onOpenChange(false);
        form.reset();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar produto");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl">
        <SheetHeader className="space-y-1 mb-8">
          <SheetTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {product ? "Editar Produto" : "Novo Produto"}
          </SheetTitle>
          <SheetDescription>
            {product ? "Atualize as informações do produto." : "Crie um novo produto na loja."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camisa Oficial 2026" {...field} className="bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição detalhada do produto" {...field} className="bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Vestuário" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Base (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                        className="bg-background/50" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stockType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Estoque</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="SOB_DEMANDA">Sob Demanda (Sem limite)</option>
                      <option value="ESTOQUE_FIXO">Estoque Fixo (Controlado)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock fields removed from Product level, now on Variants */}

            <div className="space-y-4">
              <FormLabel>Imagens</FormLabel>
              <div className="flex flex-wrap gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 mb-1 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Variantes</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => appendVariant({ sku: "", priceAdjustment: 0 })}
                  className="h-8 gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar Variante
                </Button>
              </div>

              {variantFields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma variante cadastrada.</p>
              ) : (
                <div className="space-y-4">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-background/30 p-3 rounded-lg border border-white/5">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field: inputField }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">SKU *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: CAM-P" {...inputField} className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.size`}
                        render={({ field: inputField }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Tamanho</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: P" {...inputField} value={inputField.value || ""} className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.color`}
                        render={({ field: inputField }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Cor</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Azul" {...inputField} value={inputField.value || ""} className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.priceAdjustment`}
                          render={({ field: inputField }) => (
                            <FormItem className="col-span-3">
                              <FormLabel className="text-xs">Ajuste (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  {...inputField} 
                                  onChange={(e) => inputField.onChange(parseFloat(e.target.value) || 0)} 
                                  className="h-8 text-sm" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {stockType === "ESTOQUE_FIXO" && (
                        <div className="grid grid-cols-12 gap-3 items-end mt-2">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.stockQuantity`}
                            render={({ field: inputField }) => (
                              <FormItem className="col-span-4">
                                <FormLabel className="text-xs">Estoque Atual</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...inputField} 
                                    value={inputField.value ?? ""}
                                    onChange={(e) => inputField.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} 
                                    className="h-8 text-sm" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.initialStockQuantity`}
                            render={({ field: inputField }) => (
                              <FormItem className="col-span-4">
                                <FormLabel className="text-xs">Estoque Inicial</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...inputField} 
                                    value={inputField.value ?? ""}
                                    onChange={(e) => inputField.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} 
                                    className="h-8 text-sm" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.stockAlertThreshold`}
                            render={({ field: inputField }) => (
                              <FormItem className="col-span-4">
                                <FormLabel className="text-xs">Alerta Baixo</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...inputField} 
                                    value={inputField.value ?? ""}
                                    onChange={(e) => inputField.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} 
                                    className="h-8 text-sm" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="flex justify-end mt-2 pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-background/95 backdrop-blur-xl border-t border-white/10 flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {product ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
