"use client";

import { useEffect, useState, useCallback } from "react";
import { TestimonialResponse } from "@repo/schemas/testimonial";
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
import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testimonialToDelete, setTestimonialToDelete] = useState<TestimonialResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<TestimonialResponse[]>("/testimonials/admin");
      setTestimonials(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar depoimentos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/testimonials/admin/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      toast.success(
        !currentStatus 
          ? "Depoimento aprovado e visível publicamente." 
          : "Depoimento ocultado."
      );
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao alterar status do depoimento.");
    }
  };

  const confirmDelete = async () => {
    if (!testimonialToDelete) return;
    try {
      setIsDeleting(true);
      await apiFetch(`/testimonials/admin/${testimonialToDelete.id}`, {
        method: "DELETE",
      });
      toast.success("Depoimento excluído com sucesso!");
      setTestimonialToDelete(null);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir depoimento.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Depoimentos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie e aprove depoimentos de membros e parceiros.</p>
        </div>
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
                <TableHead>Autor</TableHead>
                <TableHead className="w-1/2">Texto</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Aprovado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Nenhum depoimento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                testimonials.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50 transition-colors border-white/5 group">
                    <TableCell className="font-medium">
                      {t.name}
                      {t.tier && (
                        <div className="text-xs text-muted-foreground">{t.tier}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <p className="line-clamp-2 text-sm">{t.text}</p>
                    </TableCell>
                    <TableCell>
                      {t.source ? (
                        <Badge variant="outline" className="capitalize">
                          {t.source}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={t.isApproved ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleApproval(t.id, t.isApproved)}
                        className={t.isApproved ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" : ""}
                      >
                        {t.isApproved ? "Aprovado" : "Aprovar"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTestimonialToDelete(t)}
                        className="h-8 px-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Excluir Depoimento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o depoimento de "{testimonialToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setTestimonialToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
