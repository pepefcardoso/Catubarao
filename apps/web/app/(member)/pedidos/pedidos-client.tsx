"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Button } from "@repo/ui/components/button";
import { ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { OrderResponse } from "@repo/schemas/store";

export function PedidosClient() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiFetch<OrderResponse[]>("/store/orders/history");
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Meus Pedidos</h1>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <ShoppingBag className="w-8 h-8" />
        Meus Pedidos
      </h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mb-6">Você ainda não realizou nenhuma compra na loja.</p>
            <Button asChild>
              <Link href="/loja">Ir para a Loja</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Realizado em {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium">
                    Total: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items?.length} item(s)
                  </p>
                </div>
                <Button variant="outline" asChild className="w-full sm:w-auto shrink-0">
                  <Link href={`/pedidos/${order.id}`}>
                    Ver detalhes
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", variant: "secondary" },
    PAGO: { label: "Pago", variant: "default" },
    EM_PRODUCAO: { label: "Em Produção", variant: "default" },
    ENVIADO: { label: "Enviado", variant: "default" },
    ENTREGUE: { label: "Entregue", variant: "outline" },
    CANCELADO: { label: "Cancelado", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "secondary" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
