"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Button } from "@repo/ui/components/button";
import { Package, Truck, MapPin, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { OrderResponse } from "@repo/schemas/store";

export function PedidoDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        // ID can be passed from the URL
        const data = await apiFetch<OrderResponse>(`/store/orders/${id}`);
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to load order", err);
        setError("Não foi possível carregar os detalhes do pedido.");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-red-800">
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <h3 className="text-lg font-bold mb-2">Ops!</h3>
            <p className="mb-6">{error || "Pedido não encontrado."}</p>
            <Button asChild variant="outline" className="border-red-200 hover:bg-red-100">
              <Link href="/loja">Voltar para a Loja</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">
            Realizado em {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden shrink-0">
                      {item.product?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product?.name || "Produto Removido"}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.size && `Tamanho: ${item.variant.size}`}
                          {item.variant.color && ` | Cor: ${item.variant.color}`}
                        </p>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm">Quantidade: {item.quantity}</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium">Endereço de Entrega</h5>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {order.shippingAddress?.street}, {order.shippingAddress?.number}
                    {order.shippingAddress?.complement && ` - ${order.shippingAddress.complement}`}
                    <br />
                    {order.shippingAddress?.neighborhood}
                    <br />
                    {order.shippingAddress?.city} - {order.shippingAddress?.state}
                    <br />
                    CEP: {order.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h5 className="font-medium mb-2">Previsão de Entrega</h5>
                <p className="text-sm text-muted-foreground">
                  O prazo estimado para separação e envio é de <strong className="text-foreground">2 a 5 dias úteis</strong> após a confirmação do pagamento.
                </p>
              </div>

              {order.trackingCode && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-1">Código de Rastreio</h5>
                  <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                    {order.trackingCode}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Order Summary */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span className="text-green-600 font-medium">Grátis</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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

  return <Badge variant={config.variant} className="text-sm px-3 py-1">{config.label}</Badge>;
}
