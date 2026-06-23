"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { ProductResponse, CreateOrderSchema } from "@repo/schemas/store";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";

// Initialize Mercado Pago
initMercadoPago(env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: "pt-BR" });

const checkoutFormSchema = z.object({
  email: z.string().email("E-mail inválido"),
  name: z.string().min(3, "Nome muito curto"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter apenas 11 números"),
  zipCode: z.string().length(8, "CEP deve conter 8 números"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 letras"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const productId = searchParams.get("productId");
  const variantSku = searchParams.get("variantSku");

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: session?.user?.email || "",
      name: session?.user?.name || "",
      cpf: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    if (!productId) {
      router.push("/loja");
      return;
    }

    async function fetchProduct() {
      try {
        const data = await apiFetch<ProductResponse>(`/store/products/${productId}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [productId, router]);

  // Handle viaCEP
  const zipCode = form.watch("zipCode");
  useEffect(() => {
    if (zipCode && zipCode.length === 8) {
      fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            form.setValue("street", data.logradouro || "");
            form.setValue("neighborhood", data.bairro || "");
            form.setValue("city", data.localidade || "");
            form.setValue("state", data.uf || "");
            form.clearErrors(["street", "neighborhood", "city", "state"]);
          }
        })
        .catch(console.error);
    }
  }, [zipCode, form]);

  if (loadingProduct) {
    return <div className="text-center py-12">Carregando detalhes do pedido...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Produto não encontrado.</div>;
  }

  const selectedVariant = product.variants?.find((v) => v.sku === variantSku) || null;
  const basePrice = Number(product.basePrice);
  const priceAdjustment = selectedVariant ? Number(selectedVariant.priceAdjustment || 0) : 0;
  const unitPrice = basePrice + priceAdjustment;

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function onSubmit(data: CheckoutFormValues) {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        guestEmail: !session?.user ? data.email : null,
        guestCpf: data.cpf,
        customerId: session?.user?.id || null,
        shippingAddress: {
          street: data.street,
          number: data.number,
          complement: data.complement || null,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        items: [
          {
            productId: product!.id,
            variantId: selectedVariant?.id || null,
            quantity: 1, // Phase 4 specifies simple single-page checkout
          },
        ],
      };

      const res = await apiFetch<{ orderId: string; preferenceId: string; checkoutUrl?: string }>("/store/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      if (res.preferenceId) {
        setPreferenceId(res.preferenceId);
      } else if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao criar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {product.images?.[0] && (
              <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted border">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground mt-1">
                  Opção: {selectedVariant.size} {selectedVariant.color}
                </p>
              )}
              <div className="mt-2 text-lg font-bold">{formatter.format(unitPrice)}</div>
            </div>
          </CardContent>
        </Card>

        {preferenceId ? (
          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Wallet
                initialization={{ preferenceId, redirectMode: "self" }}
                customization={{ texts: { action: "pay", valueProp: "security_details" } }}
                onReady={() => console.log("Wallet Brick is ready")}
                onError={(error) => console.error(error)}
              />
            </CardContent>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF (Apenas números)</FormLabel>
                        <FormControl>
                          <Input placeholder="00000000000" maxLength={11} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000000" maxLength={8} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Rua/Avenida</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua Tubarão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Complemento (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto 42" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Tubarão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado (UF)</FormLabel>
                          <FormControl>
                            <Input placeholder="SC" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={isSubmitting}>
                {isSubmitting ? "Processando..." : "Continuar para Pagamento"}
              </Button>
            </form>
          </Form>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-8 space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>Compra Segura</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>Seus dados estão protegidos. Utilizamos a plataforma Mercado Pago para processar todos os pagamentos com segurança.</p>
              <p>Em caso de dúvidas sobre a entrega ou o produto, entre em contato com nossa central de atendimento.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
