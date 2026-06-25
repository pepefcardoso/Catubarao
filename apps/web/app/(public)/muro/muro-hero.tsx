import { ClubCrest } from "@/components/ClubCrest";

export function MuroHero({ count }: { count: number }) {
  return (
    <div className="py-16 md:py-24 text-center px-4">
      <div className="mx-auto mb-6 flex justify-center">
        <ClubCrest size={64} />
      </div>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-brand-primary tracking-tight mb-4">
        Muro dos Fundadores
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        Estes nomes serão eternizados na sede do clube. Conheça os sócios fundadores que estão reconstruindo o Tubarão.
      </p>
      <div className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
        {count} {count === 1 ? "fundador" : "fundadores"}
      </div>
    </div>
  );
}
