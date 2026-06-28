"use client";

import { useEffect, useState, useCallback } from "react";
import { AnnouncementBannerResponse } from "@repo/schemas/banner";
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
import { Plus, Edit, Trash2, Calendar, Loader2, Link as LinkIcon } from "lucide-react";
import { BannerSheet } from "./components/banner-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { toast } from "sonner";
import { Switch } from "@repo/ui/components/switch";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AnnouncementBannerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AnnouncementBannerResponse | null>(null);

  const [bannerToDelete, setBannerToDelete] = useState<AnnouncementBannerResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<{ banners: AnnouncementBannerResponse[] }>("/announcements/admin?limit=50");
      setBanners(data.banners);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar anúncios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleCreate = () => {
    setSelectedBanner(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (banner: AnnouncementBannerResponse) => {
    setSelectedBanner(banner);
    setIsSheetOpen(true);
  };

  const toggleIsActive = async (banner: AnnouncementBannerResponse, checked: boolean) => {
    try {
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: checked } : b));
      await apiFetch(`/announcements/admin/${banner.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: checked }),
      });
      toast.success(`Anúncio ${checked ? 'ativado' : 'desativado'}.`);
    } catch (error) {
      toast.error("Erro ao atualizar status.");
      fetchBanners();
    }
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      setIsDeleting(true);
      await apiFetch(`/announcements/admin/${bannerToDelete.id}`, {
        method: "DELETE",
      });
      toast.success("Anúncio excluído com sucesso!");
      setBannerToDelete(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir anúncio.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (banner: AnnouncementBannerResponse) => {
    if (!banner.isActive) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inativo</Badge>;
    }
    if (banner.expiresAt && new Date(banner.expiresAt) < new Date()) {
      return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">Expirado</Badge>;
    }
    return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Ativo</Badge>;
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Anúncios e Badges
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie anúncios globais, badges e marcos de transparência.</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all gap-2">
          <Plus className="w-4 h-4" />
          Novo Anúncio
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
                <TableHead>Texto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum anúncio encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id} className="hover:bg-muted/50 transition-colors border-white/5 group">
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {banner.text}
                      {banner.link && (
                        <a href={banner.link} target="_blank" rel="noreferrer" className="inline-flex items-center ml-2 text-primary hover:underline">
                          <LinkIcon className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {banner.type}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={(checked: boolean) => toggleIsActive(banner, checked)}
                      />
                    </TableCell>
                    <TableCell>{getStatusBadge(banner)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                      {banner.expiresAt ? (
                        <>
                          <Calendar className="w-3 h-3 opacity-50" />
                          {new Date(banner.expiresAt).toLocaleDateString("pt-BR")}
                        </>
                      ) : (
                        <span className="opacity-50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(banner)}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setBannerToDelete(banner)}
                          className="h-8 px-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <BannerSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        banner={selectedBanner}
        onSaved={fetchBanners}
      />

      <Dialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Excluir Anúncio</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{bannerToDelete?.text}"? Esta ação ocultará permanentemente este anúncio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setBannerToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
