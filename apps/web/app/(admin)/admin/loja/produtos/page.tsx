"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductResponse } from "@repo/schemas/store";
import { apiFetch } from "@/lib/api";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Plus, Edit, Archive, Package, Loader2, Image as ImageIcon } from "lucide-react";
import { ProductSheet } from "./components/product-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { toast } from "sonner";
import { env } from "@/lib/env";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

  const [productToDeactivate, setProductToDeactivate] = useState<ProductResponse | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<ProductResponse[]>("/admin/store/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar produtos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!productToDeactivate) return;
    try {
      setIsDeactivating(true);
      const url = `${env.NEXT_PUBLIC_API_URL}/admin/store/products/${productToDeactivate.id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 409) {
        toast.error("Não é possível desativar este produto pois existem pedidos em andamento.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to deactivate");
      }

      toast.success("Produto desativado com sucesso!");
      setProductToDeactivate(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao desativar produto.");
    } finally {
      setIsDeactivating(false);
    }
  };

  const getStatusBadge = (product: ProductResponse) => {
    if (!product.isActive) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inativo</Badge>;
    }
    return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Ativo</Badge>;
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Gestão de Produtos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os produtos da loja do Tubarão.</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      <div className="rounded-xl border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-16">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants?.reduce((acc, v) => acc + (v.stockQuantity ?? 0), 0) ?? 0;
                  const isLowStock = product.variants?.some(v => (v.stockQuantity ?? 0) <= (v.stockAlertThreshold ?? 0)) ?? false;
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50 transition-colors border-white/5 group">
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 bg-muted/50 rounded-md border border-white/10 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {product.name}
                        {product.membersOnly && (
                          <Badge variant="outline" className="ml-2 text-[10px] bg-primary/10 text-primary border-primary/20">Sócios</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {product.category}
                      </TableCell>
                      <TableCell className="font-mono">
                        R$ {product.basePrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {product.stockType === "ESTOQUE_FIXO" ? (
                          <div className="flex flex-col">
                            <span className="text-sm">{totalStock} un.</span>
                            {isLowStock && (
                              <span className="text-[10px] text-red-500">Estoque Baixo</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Sob Demanda</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(product)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(product)}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setProductToDeactivate(product)}
                            disabled={!product.isActive}
                            className="h-8 px-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <ProductSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={selectedProduct}
        onSaved={fetchProducts}
      />

      <Dialog open={!!productToDeactivate} onOpenChange={(open) => !open && setProductToDeactivate(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Desativar Produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar "{productToDeactivate?.name}"? Ele deixará de aparecer na loja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setProductToDeactivate(null)} disabled={isDeactivating}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeactivate} 
              disabled={isDeactivating}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            >
              {isDeactivating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sim, Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
