import { DebtDashboard } from "./components/DebtDashboard";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Painel de Dívidas | Portal de Transparência",
    description: "Acompanhe a reestruturação e as dívidas do Clube Atlético Tubarão.",
  };
}
export default function DividasPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <section className="px-4 py-16 bg-muted/30 sm:px-6 lg:px-8 border-b">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Painel de Dívidas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe o detalhamento das obrigações e a evolução da nossa reestruturação financeira.
          </p>
        </div>
      </section>

      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <DebtDashboard />
      </div>
    </div>
  );
}
