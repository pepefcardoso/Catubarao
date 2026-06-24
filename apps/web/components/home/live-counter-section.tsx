import { StatsMembersResponse } from "@repo/schemas/stats";
import { MemberCounterWidget } from "./member-counter-widget";

interface LiveCounterSectionProps {
  initialData: StatsMembersResponse;
}

export function LiveCounterSection({ initialData }: LiveCounterSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="container px-4 mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            X tubarões já entraram. <span className="text-brand-primary">Falta você.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nosso contador não para de subir. Cada novo sócio é um passo a mais para reconstruir a nossa história.
          </p>
        </div>

        <div className="py-6">
          <MemberCounterWidget initialData={initialData} />
        </div>
      </div>
    </section>
  );
}
