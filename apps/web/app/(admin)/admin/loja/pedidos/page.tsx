"use client";

import { useEffect, useState, useCallback } from "react";
import { OrderResponse, OrderStatusEnum } from "@repo/schemas/store";
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
import { Loader2, PackageSearch, Eye } from "lucide-react";
import { OrderSheet } from "./components/order-sheet";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = statusFilter === "ALL" ? "/admin/store/orders" : `/admin/store/orders?status=${statusFilter}`;
      const data = await apiFetch<OrderResponse[]>(url);
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleView = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      AGUARDANDO_PAGAMENTO: { label: "Aguardando", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      PAGO: { label: "Pago", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      EM_PRODUCAO: { label: "Em Produção", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      ENVIADO: { label: "Enviado", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      ENTREGUE: { label: "Entregue", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      CANCELADO: { label: "Cancelado", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    };
    const info = map[status];
    if (!info) return <Badge variant="outline">{status}</Badge>;
    return <Badge variant="outline" className={info.className}>{info.label}</Badge>;
  };

  const hasSobDemanda = (order: any) => {
    return order.items?.some((item: any) => item.product?.stockType === "SOB_DEMANDA");
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Gestão de Pedidos
          </h1>
          <p className="text-muted-foreground mt-1">Acompanhe e gerencie os pedidos da loja.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Filtrar:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ALL">Todos os status</option>
            <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
            <option value="PAGO">Pago</option>
            <option value="EM_PRODUCAO">Em Produção</option>
            <option value="ENVIADO">Enviado</option>
            <option value="ENTREGUE">Entregue</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="w-24">Pedido</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-center">Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent border-white/5">
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => {
                  const itemsCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  const isSobDemanda = hasSobDemanda(order);

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors border-white/5 group cursor-pointer" onClick={() => handleView(order)}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {order.id.split("-")[0].toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{order.guestEmail || order.customer?.name || "Visitante"}</span>
                          {order.guestCpf || order.customer?.cpf ? (
                            <span className="text-xs text-muted-foreground">{order.guestCpf || order.customer?.cpf}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {itemsCount}
                        {isSobDemanda && (
                          <Badge variant="outline" className="ml-2 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">Sob Demanda</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        R$ {order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground group-hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(order);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
          </TableBody>
        </Table>
      </div>

      <OrderSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        order={selectedOrder}
        onSaved={fetchOrders}
      />
    </div>
  );
}
