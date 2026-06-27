import { CreditCard, Landmark, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";

export function BenefitStripSection() {
  const benefits = [
    {
      icon: <CreditCard className="w-10 h-10 text-brand-primary" />,
      title: "Carteirinha Digital",
      description: "Acesse os jogos com o seu celular. Sem filas, sem complicações.",
    },
    {
      icon: <Landmark className="w-10 h-10 text-brand-primary" />,
      title: "Voto em Assembleias",
      description: "Tenha voz ativa nas decisões cruciais para o futuro do Atlético Tubarão.",
    },
    {
      icon: <Users className="w-10 h-10 text-brand-primary" />,
      title: "Muro dos Fundadores",
      description: "Seu nome eternizado na entrada da Vila como um dos reconstrutores.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Card key={i} className="border-none shadow-md bg-card/50 hover:bg-card transition-colors duration-300">
              <CardHeader className="pb-2">
                <div className="mb-4 bg-brand-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                  {benefit.icon}
                </div>
                <CardTitle className="text-xl font-bold">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
