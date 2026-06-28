"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ArrowLeft, Building2, Plus, Edit, Mail, Phone, MapPin } from "lucide-react";
import { DealCard } from "../components/deal-card";
import { DealSheet } from "../components/deal-sheet";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";

export default function PartnerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;
  
  const [partner, setPartner] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDealSheetOpen, setIsDealSheetOpen] = useState(false);

  const fetchPartnerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [partnerData, dealsData] = (await Promise.all([
        apiFetch(`/admin/partners/${partnerId}`),
        apiFetch(`/admin/partners/${partnerId}/deals`),
      ])) as [any, any[]];
      setPartner(partnerData);
      setDeals(dealsData);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar os dados do parceiro.");
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
        <div className="flex gap-4 items-start">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <Building2 className="w-12 h-12 mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Parceiro não encontrado</h2>
        <p className="text-muted-foreground mb-6">O parceiro que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push("/parceiros")}>Voltar para Parceiros</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/parceiros")} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-sm text-muted-foreground breadcrumbs">
          <span>Admin</span> &gt; <span>Parceiros</span> &gt; <span className="font-medium text-foreground">{partner.tradeName}</span>
        </div>
      </div>

      {/* Partner Header */}
      <div className="bg-card border rounded-lg p-6 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex gap-5">
          <div className="bg-muted w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{partner.tradeName}</h1>
              {getStatusBadge(partner.status)}
            </div>
            <p className="text-muted-foreground font-medium">{partner.legalName}</p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Segmento: {partner.segment}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${partner.contactEmail}`} className="hover:underline text-primary">{partner.contactEmail}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{partner.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" className="shrink-0">
          <Edit className="w-4 h-4 mr-2" />
          Editar Parceiro
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deals" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="deals">Acordos ({deals.length})</TabsTrigger>
          <TabsTrigger value="info">Informações Adicionais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico de Acordos</h3>
            <Button onClick={() => setIsDealSheetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Acordo
            </Button>
          </div>

          {deals.length === 0 ? (
            <div className="border border-dashed rounded-lg p-12 text-center flex flex-col items-center">
              <div className="bg-muted p-3 rounded-full mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">Nenhum acordo cadastrado</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Este parceiro ainda não possui acordos comerciais. Clique em "Novo Acordo" para começar.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {deals.map(deal => (
                <DealCard key={deal.id} deal={deal} onRefresh={fetchPartnerData} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">CNPJ</h4>
              <p>{partner.cnpj || "Não informado"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Nome do Contato Principal</h4>
              <p>{partner.contactName}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Anotações</h4>
              <p className="whitespace-pre-wrap">{partner.notes || "Sem anotações"}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DealSheet 
        partnerId={partnerId} 
        open={isDealSheetOpen} 
        onOpenChange={setIsDealSheetOpen} 
        onSuccess={fetchPartnerData} 
      />
    </div>
  );
}
