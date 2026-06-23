"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@repo/ui/components/skeleton";
import { 
  Plus, 
  Briefcase, 
  Building2,
  Mail,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "sonner";
import { z } from "zod";
import { PartnerResponseSchema } from "@repo/schemas/partner";
import { PartnerSheet } from "./components/partner-sheet";

type PartnerResponse = z.infer<typeof PartnerResponseSchema>;

export default function AdminPartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchPartners = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      query.append("limit", "50");
      if (statusFilter !== "ALL") {
        query.append("status", statusFilter);
      }
      
      const data = await apiFetch<{ partners: PartnerResponse[] }>(`/admin/partners?${query.toString()}`);
      setPartners(data.partners);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar parceiros.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROSPECT":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">Prospecto</Badge>;
      case "ACTIVE":
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Ativo</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inativo</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parceiros</h1>
          <p className="text-muted-foreground">
            Gerencie patrocinadores, parceiros comerciais e permutas.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PROSPECT">Prospecto</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parceiro</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Negócios Ativos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loader
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : partners.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Building2 className="w-10 h-10 mb-4 opacity-50" />
                    <p className="font-medium text-lg text-foreground">Nenhum parceiro encontrado</p>
                    <p className="text-sm">Não há parceiros cadastrados com este status.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Partner Rows
              partners.map((partner) => (
                <TableRow 
                  key={partner.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${partner.status === "CANCELLED" ? "opacity-60 grayscale-[0.5]" : ""}`}
                  onClick={() => router.push(`/parceiros/${partner.id}`)}
                >
                  <TableCell className="font-medium">
                    {partner.tradeName}
                    <div className="text-xs text-muted-foreground font-normal">{partner.legalName}</div>
                  </TableCell>
                  <TableCell>{partner.segment}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">{partner.contactEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(partner.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 font-medium">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      {partner.activeDealsCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PartnerSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSuccess={fetchPartners}
      />
    </div>
  );
}
