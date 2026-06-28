"use client";

import { useEffect, useState, useCallback } from "react";
import { TransparencyPostResponse } from "@repo/schemas/transparency";
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
import { Plus, Edit, Archive, FileText, Calendar, Loader2 } from "lucide-react";
import { PostSheet } from "./components/post-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { toast } from "sonner";

export default function AdminTransparencyPage() {
  const [posts, setPosts] = useState<TransparencyPostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<TransparencyPostResponse | null>(null);

  const [postToArchive, setPostToArchive] = useState<TransparencyPostResponse | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<{ posts: TransparencyPostResponse[] }>("/transparency/admin/posts?limit=50");
      setPosts(data.posts);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar publicações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = () => {
    setSelectedPost(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (post: TransparencyPostResponse) => {
    setSelectedPost(post);
    setIsSheetOpen(true);
  };

  const confirmArchive = async () => {
    if (!postToArchive) return;
    try {
      setIsArchiving(true);
      await apiFetch(`/transparency/posts/${postToArchive.id}/archive`, {
        method: "PATCH",
      });
      toast.success("Publicação arquivada com sucesso!");
      setPostToArchive(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao arquivar publicação.");
    } finally {
      setIsArchiving(false);
    }
  };

  const getStatusBadge = (post: TransparencyPostResponse) => {
    if (post.isArchived) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Arquivado</Badge>;
    }
    if (post.scheduledFor && new Date(post.scheduledFor) > new Date()) {
      return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">Agendado</Badge>;
    }
    return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Ativo</Badge>;
  };

  const formatCategory = (category: string) => {
    const labels: Record<string, string> = {
      BALANCO_MENSAL: "Balanço Mensal",
      STATUS_DIVIDAS: "Status Dívidas",
      ATA_ASSEMBLEIA: "Ata Assembleia",
      COMPOSICAO_SOCIETARIA: "Societária",
      DOCUMENTO_SAF: "Doc SAF",
      OUTRO: "Outro"
    };
    return labels[category] || category;
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Portal de Transparência
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie as publicações, balanços e documentos.</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all gap-2">
          <Plus className="w-4 h-4" />
          Nova Publicação
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
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Nenhuma publicação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/50 transition-colors border-white/5 group">
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {post.title}
                      {post.attachmentUrl && (
                        <FileText className="inline w-3 h-3 ml-2 text-muted-foreground/50" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCategory(post.category)}
                      {post.referenceMonth && post.referenceYear && (
                        <span className="text-xs ml-2 opacity-50">
                          ({post.referenceMonth}/{post.referenceYear})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(post)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background/50">v{post.version}</Badge>
                        {!post.supersededById && (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20">versão atual</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                      <Calendar className="w-3 h-3 opacity-50" />
                      {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(post)}
                          disabled={post.isArchived}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPostToArchive(post)}
                          disabled={post.isArchived}
                          className="h-8 px-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Archive className="w-4 h-4" />
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

      <PostSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        post={selectedPost}
        onSaved={fetchPosts}
      />

      <Dialog open={!!postToArchive} onOpenChange={(open) => !open && setPostToArchive(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Arquivar Publicação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja arquivar "{postToArchive?.title}"? Esta ação removerá a publicação do portal público.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setPostToArchive(null)} disabled={isArchiving}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmArchive} 
              disabled={isArchiving}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            >
              {isArchiving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sim, Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
