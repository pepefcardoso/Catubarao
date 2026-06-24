import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { StatsMembersResponse } from "@repo/schemas/stats";

interface CtaFooterSectionProps {
  initialData: StatsMembersResponse;
}

export function CtaFooterSection({ initialData }: CtaFooterSectionProps) {
  return (
    <section className="relative py-24 md:py-32 bg-zinc-950 overflow-hidden border-t border-zinc-800">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container relative z-10 px-4 mx-auto text-center space-y-10 max-w-4xl">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase font-heading">
          Faça parte da <br className="hidden md:block" />
          <span className="text-brand-primary">reconstrução</span>
        </h2>
        
        <p className="text-xl text-zinc-300 font-medium">
          Junte-se a <strong className="text-white">{initialData.total.toLocaleString('pt-BR')}</strong> tubarões que já vestiram a camisa e estão mudando a história do nosso clube. Não fique de fora.
        </p>

        <div className="pt-4">
          <Button asChild size="lg" className="text-xl px-12 py-8 rounded-full font-black uppercase tracking-widest shadow-[0_0_40px_rgba(var(--brand-primary-rgb),0.5)] hover:scale-105 transition-transform duration-300">
            <Link href="/signup">Assinar agora</Link>
          </Button>
          <p className="mt-6 text-sm text-zinc-500 font-medium">
            Planos a partir de R$ 19,90/mês. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}
