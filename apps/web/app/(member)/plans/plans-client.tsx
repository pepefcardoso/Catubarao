"use client";

import { useState, useEffect } from "react";
import { env } from "@/lib/env";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Check, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval: "MONTHLY" | "ANNUAL";
  benefits: string[];
  isActive: boolean;
  isCorporate: boolean;
  subscriberCount?: number;
  isMostPopular?: boolean;
}

interface MeResponse {
  activePlanId?: string;
}

interface PlansClientProps {
  initialPlans: MembershipPlan[];
}

export function PlansClient({ initialPlans }: PlansClientProps) {
  const router = useRouter();
  const [interval, setInterval] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoadingMe, setIsLoadingMe] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setMe(data);
        }
      } catch (err) {
        console.error("Failed to fetch member profile:", err);
      } finally {
        setIsLoadingMe(false);
      }
    }
    fetchMe();
  }, []);

  const activePlans = initialPlans.filter((p) => p.isActive);
  
  // Group plans by name so we can switch between monthly/annual easily,
  // or we just filter the plans by interval.
  // The API returns all plans. Let's filter by the selected interval.
  const displayedPlans = activePlans.filter((p) => p.interval === interval);

  // But what if a plan is corporate? Corporate plans might only have one interval, or they are separate.
  // Usually, we just show plans for the selected interval, plus corporate plans if they don't depend on interval or just show them anyway.
  // Let's separate corporate plans.
  const standardPlans = displayedPlans.filter((p) => !p.isCorporate);
  const corporatePlans = activePlans.filter((p) => p.isCorporate);

  const solidarioPlan = standardPlans.find(p => p.name.toLowerCase().includes("solidário"));
  const regularPlans = standardPlans.filter(p => p.id !== solidarioPlan?.id);

  const formatPrice = (price: any) => {
    const numPrice = typeof price === "number" ? price : parseFloat(price as string);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice / 100); // Assuming price is in cents
  };

  const activePlanId = me?.activePlanId;

  const handleCheckout = (planId: string) => {
    router.push(`/checkout?planId=${planId}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Escolha seu plano</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {copy.plans.subtitle}
        </p>
      </div>

      <div className="flex justify-center">
        <Tabs value={interval} onValueChange={(v) => setInterval(v as "MONTHLY" | "ANNUAL")} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="MONTHLY">Mensal</TabsTrigger>
            <TabsTrigger value="ANNUAL">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-8 items-end">
        {regularPlans.map((plan) => {
          const isActivePlan = activePlanId === plan.id;
          const isRecommended = plan.isMostPopular; // Tied to isMostPopular as no separate flag exists

          let annualSavings = 0;
          let monthlyEquivalentPrice = 0;
          if (interval === "ANNUAL") {
            const monthlyEquivalent = activePlans.find(p => p.name === plan.name && p.interval === "MONTHLY");
            if (monthlyEquivalent) {
              annualSavings = (monthlyEquivalent.price * 12) - plan.price;
              monthlyEquivalentPrice = monthlyEquivalent.price * 12;
            }
          }

          return (
            <Card key={plan.id} className={`flex flex-col relative ${isActivePlan ? "border-primary shadow-md" : ""} ${isRecommended ? "ring-2 ring-brand-primary scale-105 z-10" : ""}`}>
              {isRecommended && (
                <div className="absolute -top-3 right-4 flex justify-center">
                  <Badge className="bg-brand-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm">Recomendado</Badge>
                </div>
              )}
              {plan.isMostPopular && (
                <div className="absolute -top-3 left-4 flex justify-center">
                  <Badge className="bg-brand-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm">Mais Popular</Badge>
                </div>
              )}
              {isActivePlan && !isRecommended && !plan.isMostPopular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">Seu Plano Atual</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.subscriberCount !== undefined && plan.subscriberCount > 0 && (
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {plan.subscriberCount} {plan.subscriberCount === 1 ? "sócio neste plano" : "sócios neste plano"}
                    </div>
                  )}
                  {interval === "ANNUAL" && annualSavings > 0 && (
                    <div className="text-sm text-green-600 font-semibold mb-1">
                      Economize {formatPrice(annualSavings)}/ano
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground">/{interval === "MONTHLY" ? "mês" : "ano"}</span>
                  </div>
                  {interval === "ANNUAL" && annualSavings > 0 && (
                    <div className="text-xs text-muted-foreground line-through mt-1">
                      {formatPrice(monthlyEquivalentPrice)}/ano
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isRecommended && !isActivePlan ? "default" : (isActivePlan ? "secondary" : "outline")}
                  disabled={isActivePlan}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {isActivePlan ? "Plano Atual" : "Assinar"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {solidarioPlan && (
          <Card key={solidarioPlan.id} className={`flex flex-col relative scale-95 opacity-90 hover:opacity-100 transition-opacity ${activePlanId === solidarioPlan.id ? "border-primary shadow-md" : ""}`}>
            {activePlanId === solidarioPlan.id && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground">Seu Plano Atual</Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <CardTitle className="text-xl">{solidarioPlan.name}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Não pode pagar? Sem problema. Você ainda faz parte.
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{formatPrice(solidarioPlan.price)}</span>
                  <span className="text-muted-foreground">/{interval === "MONTHLY" ? "mês" : "ano"}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 text-xs">
              <ul className="space-y-2 text-muted-foreground">
                {solidarioPlan.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={activePlanId === solidarioPlan.id ? "secondary" : "outline"}
                disabled={activePlanId === solidarioPlan.id}
                onClick={() => handleCheckout(solidarioPlan.id)}
              >
                {activePlanId === solidarioPlan.id ? "Plano Atual" : "Assinar"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {corporatePlans.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Planos Corporativos</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {corporatePlans.map((plan) => {
              const isActivePlan = activePlanId === plan.id;
              return (
                <Card key={plan.id} className="flex flex-col bg-muted/50 border-dashed">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription className="mt-2">
                          Soluções personalizadas para sua empresa
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Corporativo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push("/contact")} // Links to contact form per acceptance criteria
                    >
                      Falar com Consultor
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
