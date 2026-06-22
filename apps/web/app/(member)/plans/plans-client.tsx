"use client";

import { useState, useEffect } from "react";
import { env } from "@/lib/env";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval: "MONTHLY" | "ANNUAL";
  benefits: string[];
  isActive: boolean;
  isCorporate: boolean;
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
          Faça parte do Tubarão e aproveite benefícios exclusivos.
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

      <div className="grid md:grid-cols-3 gap-6 pt-8">
        {standardPlans.map((plan) => {
          const isActivePlan = activePlanId === plan.id;
          return (
            <Card key={plan.id} className={`flex flex-col relative ${isActivePlan ? "border-primary shadow-md" : ""}`}>
              {isActivePlan && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">Seu Plano Atual</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground">/{interval === "MONTHLY" ? "mês" : "ano"}</span>
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
                  variant={isActivePlan ? "secondary" : "default"}
                  disabled={isActivePlan}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {isActivePlan ? "Plano Atual" : "Assinar"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
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
