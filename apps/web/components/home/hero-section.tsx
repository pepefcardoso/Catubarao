import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export function HeroSection() {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-zinc-900">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=2000&auto=format&fit=crop"
          alt="Torcida no estádio"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
      </div>

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-8 mt-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading tracking-tighter text-white uppercase leading-[0.9]">
          O Peixe <br className="hidden sm:block" /> é nosso. <br />
          <span className="text-brand-primary">A reconstrução <br className="hidden sm:block" /> é agora.</span>
        </h1>
        <p className="text-lg md:text-2xl text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
          O resgate do nosso orgulho começa aqui. Faça parte da história e ajude a reerguer o Atlético Tubarão, o time da cidade azul.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto text-lg px-10 py-7 rounded-full font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.4)] hover:scale-105 transition-transform duration-300">
            <Link href="/signup">Seja Sócio</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 py-7 rounded-full font-bold uppercase tracking-wider bg-transparent text-white border-white hover:bg-white/10 hover:text-white transition-all duration-300">
            <Link href="/transparencia">Ver as contas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
