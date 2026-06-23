"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
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
import { Button } from "@repo/ui/components/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@repo/ui/components/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { 
  PendingDeliveryWithDetailsResponseSchema,
  DeliveryProofWithDetailsResponseSchema
} from "@repo/schemas/partner";
import { Building2, CheckCircle2, Clock, UploadCloud } from "lucide-react";
import { DeliveryProofSheet } from "../components/delivery-proof-sheet";

type PendingDelivery = z.infer<typeof PendingDeliveryWithDetailsResponseSchema>;
type CompletedDelivery = z.infer<typeof DeliveryProofWithDetailsResponseSchema>;

export default function DeliverablesDashboardPage() {
  const [pending, setPending] = useState<PendingDelivery[]>([]);
  const [completed, setCompleted] = useState<CompletedDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [selectedMatchEventId, setSelectedMatchEventId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pendingData, completedData] = await Promise.all([
        apiFetch<PendingDelivery[]>("/admin/deliverables/pending"),
        apiFetch<CompletedDelivery[]>("/admin/deliverables/completed"),
      ]);
      setPending(pendingData);
      setCompleted(completedData);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar entregas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegisterProof = (deliverableId: string, matchEventId?: string | null) => {
    setSelectedDeliverableId(deliverableId);
    setSelectedMatchEventId(matchEventId || null);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OVERDUE":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Atrasado</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Entregas</h1>
        <p className="text-muted-foreground">
          Acompanhe as entregas pendentes e concluídas de todos os negócios ativos.
        </p>
      </div>

      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="concluidas" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Concluídas (Este Mês)
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{completed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Descrição da Entrega</TableHead>
                  <TableHead>Frequência / Ref</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CheckCircle2 className="w-10 h-10 mb-4 opacity-50 text-emerald-500" />
                        <p className="font-medium text-lg text-foreground">Tudo em dia!</p>
                        <p className="text-sm">Não há entregas pendentes para o período atual.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {item.deliverable.deal.partner.tradeName}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={item.deliverable.description}>
                        {item.deliverable.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{item.deliverable.frequency}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.matchEventId ? "Jogo Específico" : item.month && item.year ? `${item.month}/${item.year}` : "Única"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.deliverable.owner.name}</TableCell>
                      <TableCell>{getStatusBadge(item.status || "PENDING")}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => handleRegisterProof(item.deliverableId, item.matchEventId)}
                        >
                          <UploadCloud className="w-4 h-4 mr-2" />
                          Registrar Entrega
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="concluidas">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Descrição da Entrega</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Data da Entrega</TableHead>
                  <TableHead>Evidência</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : completed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Clock className="w-10 h-10 mb-4 opacity-50" />
                        <p className="font-medium text-lg text-foreground">Nenhuma entrega registrada este mês.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  completed.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {item.deliverable.deal.partner.tradeName}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={item.deliverable.description}>
                        {item.deliverable.description}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.deliverable.frequency}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(item.deliveredAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.evidenceType}</Badge>
                      </TableCell>
                      <TableCell>{item.author.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <DeliveryProofSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deliverableId={selectedDeliverableId}
        matchEventId={selectedMatchEventId}
        onSuccess={fetchData}
      />
    </div>
  );
}
