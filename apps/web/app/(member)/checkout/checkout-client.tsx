"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { env } from "@/lib/env";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import Image from "next/image";

interface CheckoutClientProps {
  plan: any;
  mpPublicKey: string;
}

export function CheckoutClient({ plan, mpPublicKey }: CheckoutClientProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
  const [pollingSubscriptionId, setPollingSubscriptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "WAITING_CONFIRMATION" | "FAILED">("IDLE");

  useEffect(() => {
    initMercadoPago(mpPublicKey, { locale: "pt-BR" });
    setIsClient(true);
  }, [mpPublicKey]);

  useEffect(() => {
    if (!pollingSubscriptionId || status !== "WAITING_CONFIRMATION") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/subscriptions/${pollingSubscriptionId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const sub = await res.json();
          if (sub.status === "ACTIVE") {
            clearInterval(interval);
            toast.success("Pagamento confirmado! Bem-vindo(a)!");
            if (sub.isFirstSubscription) {
              router.push("/welcome");
            } else {
              const params = new URLSearchParams(window.location.search);
              if (params.get("reactivate") === "true") {
                router.push("/dashboard?reactivated=true");
              } else {
                router.push("/dashboard");
              }
            }
          } else if (sub.status === "CANCELLED" || sub.status === "FAILED") {
            clearInterval(interval);
            setStatus("FAILED");
            toast.error("Ocorreu um erro no pagamento.");
          }
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 3000);

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === "WAITING_CONFIRMATION") {
        toast.info("Ainda aguardando confirmação. O status será atualizado no seu painel em breve.");
        router.push("/dashboard");
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pollingSubscriptionId, status, router]);

  const handleSubmit = async (formData: any) => {
    setStatus("PROCESSING");
    
    const paymentMethod = formData.payment_method_id === "pix" ? "pix" : "card";
    
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod,
          token: formData.token,
          issuer_id: formData.issuer_id,
          payment_method_id: formData.payment_method_id,
          installments: formData.installments,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      const data = await res.json();
      
      setPollingSubscriptionId(data.subscriptionId);
      setStatus("WAITING_CONFIRMATION");

      if (paymentMethod === "pix") {
        setPixData({
          qrCode: data.pixQrCode,
          qrCodeBase64: data.pixQrCodeBase64,
        });
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro ao processar o pagamento");
      setStatus("FAILED");
    }
  };

  if (!isClient) return null;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
            <CardDescription>Confirme os detalhes do seu plano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between font-medium">
              <span>{plan.name}</span>
              <span>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plan.price / 100)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Cobrança {plan.interval === "MONTHLY" ? "Mensal" : "Anual"}
            </div>
            
            {status === "WAITING_CONFIRMATION" && (
              <div className="mt-8 p-4 bg-muted rounded-md text-center">
                <p className="font-medium text-lg">Aguardando confirmação...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Estamos processando seu pagamento. Isso pode levar alguns segundos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        {status === "FAILED" ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Falha no Pagamento</CardTitle>
              <CardDescription>
                Não foi possível processar seu pagamento. Por favor, verifique os dados ou tente outra forma de pagamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={() => {
                  setStatus("IDLE");
                  setPixData(null);
                  setPollingSubscriptionId(null);
                }}
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : !pixData ? (
          <div className="bg-background rounded-xl overflow-hidden border">
            <Payment
              initialization={{ amount: plan.price / 100 }}
              customization={{
                paymentMethods: {
                  creditCard: "all",
                },
              }}
              onSubmit={async ({ selectedPaymentMethod, formData }) => {
                await handleSubmit(formData);
              }}
              onError={(error) => {
                console.error(error);
                if (status === "IDLE") {
                   toast.error("Ocorreu um erro ao inicializar o pagamento.");
                }
              }}
            />
          </div>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Pague com Pix</CardTitle>
              <CardDescription>Escaneie o QR Code ou copie o código Pix Copia e Cola</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {pixData.qrCodeBase64 && (
                <div className="border p-4 rounded-lg bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" width={250} height={250} />
                </div>
              )}
              
              <div className="w-full text-center space-y-2">
                <p className="font-medium text-sm">Pix Copia e Cola:</p>
                <code className="block p-3 bg-muted rounded break-all text-xs border text-left">
                  {pixData.qrCode}
                </code>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.qrCode);
                    toast.success("Código copiado!");
                  }}
                >
                  Copiar Código
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
