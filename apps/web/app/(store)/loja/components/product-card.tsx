"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductResponse } from "@repo/schemas/store";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { CheckCircle } from "lucide-react";
import { useMemberStatus } from "@/lib/use-member-status";

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockType === "ESTOQUE_FIXO" && product.stockQuantity === 0;
  const { isMember, isActive } = useMemberStatus();

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Link href={`/produtos/${product.id}`} className="group">
      <Card className="h-full overflow-hidden border transition-all hover:shadow-md dark:hover:shadow-white/5">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-col gap-2 z-10">
            {product.membersOnly && (
              isMember && isActive ? (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white shadow-md flex items-center gap-1.5 px-2.5 py-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Sócio
                </Badge>
              ) : (
                <Badge className="bg-primary text-primary-foreground shadow-sm">
                  Exclusivo para sócios
                </Badge>
              )
            )}
            {isOutOfStock && (
              <Badge variant="destructive">
                Esgotado
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="font-bold text-xl">
            {formatter.format(product.basePrice)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
