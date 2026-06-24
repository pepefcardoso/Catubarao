"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface StockNotificationModalProps {
  variantId: string;
  productName: string;
}

export function StockNotificationModal({ variantId, productName }: StockNotificationModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    try {
      setIsLoading(true);
      await apiFetch("/store/products/notify-stock", {
        method: "POST",
        body: JSON.stringify({ email, variantId }),
      });
      toast.success("Aviso configurado! Avisaremos quando o produto voltar.");
      setOpen(false);
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao configurar aviso. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-3 bg-background/50 hover:bg-background border-primary/20 text-primary hover:text-primary z-20 relative"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Bell className="w-4 h-4 mr-2" />
          Avise-me quando voltar
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Produto Esgotado</DialogTitle>
          <DialogDescription>
            Deixe seu e-mail para ser avisado quando <strong>{productName}</strong> voltar ao estoque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Avise-me
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
