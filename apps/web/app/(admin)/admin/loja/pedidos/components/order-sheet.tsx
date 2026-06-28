"use client";

import { useState, useEffect } from "react";
import { OrderResponse, UpdateOrderStatusSchema } from "@repo/schemas/store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { Loader2, Package, Truck, CheckCircle2, Save, MapPin, CreditCard, Info } from "lucide-react";
import { toast } from "sonner";
import { env } from "@/lib/env";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSaved: () => void;
}

export function OrderSheet({ open, onOpenChange, order, onSaved }: OrderSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("AGUARDANDO_PAGAMENTO");
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingCode(order.trackingCode || "");
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;

    if (status === "ENVIADO" && !trackingCode.trim()) {
      toast.error("Código de rastreio é obrigatório ao marcar como ENVIADO.");
      return;
    }

    try {
      setIsSaving(true);
      const url = `${env.NEXT_PUBLIC_API_URL}/admin/store/orders/${order.id}/status`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          trackingCode: trackingCode.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status atualizado com sucesso!");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar o status do pedido.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl sm:rounded-l-2xl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">Pedido #{order.id.split("-")[0].toUpperCase()}</SheetTitle>
              <SheetDescription>
                {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
              </SheetDescription>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-white/5">{order.status}</Badge>
          </div>
        </SheetHeader>

        <div className="space-y-8 pb-20">
          {/* Status Update Section */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <Package className="w-4 h-4" /> Atualizar Status
            </h3>
            
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                <option value="PAGO">Pago</option>
                <option value="EM_PRODUCAO">Em Produção</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADO">Cancelado</option>
              </select>

              {status === "ENVIADO" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    placeholder="Código de Rastreio (Ex: AB123456789BR)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full h-10 rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-primary/10 p-2 rounded-md border border-primary/20">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <span>O cliente será notificado por e-mail automaticamente com este código de rastreio.</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </Button>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Dados do Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <p className="text-muted-foreground mb-1">Nome/Email</p>
                <p className="font-medium">{order.guestEmail || order.customer?.name || "Visitante"}</p>
                {order.customer?.email && <p className="text-xs text-muted-foreground">{order.customer.email}</p>}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">CPF</p>
                <p className="font-medium">{order.guestCpf || order.customer?.cpf || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Endereço de Entrega
            </h3>
            <div className="text-sm bg-white/5 p-4 rounded-xl border border-white/10">
              <p>{order.shippingAddress.street}, {order.shippingAddress.number} {order.shippingAddress.complement && `- ${order.shippingAddress.complement}`}</p>
              <p>{order.shippingAddress.neighborhood}</p>
              <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
              <p>CEP: {order.shippingAddress.zipCode}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <Package className="w-4 h-4" /> Itens do Pedido
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10 items-center">
                  <div className="w-12 h-12 rounded-md bg-white/10 overflow-hidden shrink-0 border border-white/10">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product?.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant.size && `Tamanho: ${item.variant.size}`}
                        {item.variant.color && ` • Cor: ${item.variant.color}`}
                      </p>
                    )}
                    {item.product?.stockType === "SOB_DEMANDA" && (
                      <Badge variant="outline" className="mt-1 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20 py-0 h-4">Sob Demanda</Badge>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm">{item.quantity}x</p>
                    <p className="font-mono text-sm text-primary">R$ {Number(item.unitPrice).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="font-semibold">Total do Pedido</span>
              <span className="font-mono text-lg font-bold text-primary">R$ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
