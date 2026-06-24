import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { ProductResponseSchema } from "@repo/schemas/store";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { ArrowRight, ShoppingBag } from "lucide-react";

type Product = z.infer<typeof ProductResponseSchema>;

interface StoreTeaserSectionProps {
  products: Product[];
}

export function StoreTeaserSection({ products }: StoreTeaserSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Loja do Tubarão</h2>
            <p className="text-lg text-muted-foreground">
              Veste o manto. Produtos oficiais com descontos exclusivos para sócios-torcedores.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full shrink-0">
            <Link href="/loja">Ver loja completa <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group flex flex-col">
              <div className="relative aspect-square bg-secondary/20 flex items-center justify-center p-6">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 pointer-events-none">
                    Destaque
                  </Badge>
                  {/* Badge Exclusivo para Sócios if applicable. Let's just simulate if the product has some specific flag or just show it for the design */}
                  <Badge className="bg-brand-primary text-white hover:bg-brand-primary pointer-events-none uppercase tracking-wider text-[10px] font-bold">
                    Exclusivo para Sócios
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1">
                <div className="text-sm text-muted-foreground font-medium mb-1">{product.category}</div>
                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-xl">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}
                  </span>
                  {/* Example showing member discount */}
                  <span className="text-xs font-bold text-brand-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice * 0.9)} p/ Sócio
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button className="w-full rounded-full group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  Comprar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
