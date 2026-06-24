"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductResponse, ProductVariantResponse } from "@repo/schemas/store";
import { useSession } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { useMemberStatus } from "@/lib/use-member-status";

interface ProductClientProps {
  product: ProductResponse;
}

export function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(
    product.variants?.[0] || null
  );

  const { isMember, isActive, isSuspended, isLoading } = useMemberStatus();

  const isOutOfStock = product.stockType === "ESTOQUE_FIXO" && (product.variants ?? []).reduce((acc, v) => acc + (v.stockQuantity ?? 0), 0) === 0;
  const isMemberOnly = product.membersOnly;

  // Final price depends on selected variant
  const basePrice = Number(product.basePrice);
  const priceAdjustment = selectedVariant ? Number(selectedVariant.priceAdjustment || 0) : 0;
  const price = basePrice + priceAdjustment;

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleAddToCart = () => {
    const url = new URL("/checkout", window.location.origin);
    url.searchParams.set("productId", product.id);
    if (selectedVariant) {
      url.searchParams.set("variantSku", selectedVariant.sku);
    }
    router.push(url.toString());
  };

  const handleGateClick = () => {
    router.push("/signup");
  };

  const renderCTA = () => {
    if (isLoading) {
      return <Button disabled className="w-full h-12 text-lg">Carregando...</Button>;
    }
    
    if (isOutOfStock) {
      return (
        <Button disabled variant="destructive" className="w-full h-12 text-lg">
          Produto Esgotado
        </Button>
      );
    }

    const ctaButton = (
      <Button 
        onClick={handleAddToCart} 
        className={`w-full h-12 text-lg font-semibold ${isMemberOnly && (!isMember || isSuspended) ? "blur-sm pointer-events-none" : ""}`}
        tabIndex={isMemberOnly && (!isMember || isSuspended) ? -1 : 0}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Adicionar ao carrinho
      </Button>
    );

    if (isMemberOnly) {
      if (!isMember) {
        return (
          <div className="relative w-full">
            {ctaButton}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={() => router.push("/signup")} className="absolute w-[105%] h-[110%] text-sm sm:text-base font-semibold shadow-lg bg-slate-900/90 hover:bg-slate-900 text-white border border-primary/20 backdrop-blur-sm z-10 transition-transform hover:scale-[1.02]">
                🔒 Exclusivo para Sócios — Seja Sócio para comprar
              </Button>
            </div>
          </div>
        );
      }

      if (isSuspended) {
        return (
          <div className="relative w-full">
            {ctaButton}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={() => router.push("/dashboard")} variant="destructive" className="absolute w-[105%] h-[110%] text-sm sm:text-base font-semibold shadow-lg z-10 transition-transform hover:scale-[1.02]">
                Regularize sua assinatura para desbloquear
              </Button>
            </div>
          </div>
        );
      }
    }

    return ctaButton;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
      {/* Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border">
          {product.images?.[activeImageIndex] ? (
            <Image
              src={product.images[activeImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}
          {isMemberOnly && (
            <div className="absolute left-4 top-4 z-10">
              {isMember && isActive ? (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white px-3 py-1.5 text-sm font-bold shadow-md flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Sócio
                </Badge>
              ) : (
                <Badge className="bg-primary text-primary-foreground px-3 py-1.5 text-sm font-semibold shadow-sm">
                  Exclusivo para sócios
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative aspect-square w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  index === activeImageIndex 
                    ? "border-primary ring-2 ring-primary/20 ring-offset-1" 
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col">
        <div className="mb-3 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
          {product.category}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
        
        <div className="text-4xl font-bold mb-6 text-foreground">
          {formatter.format(price)}
        </div>

        <div className="prose prose-sm dark:prose-invert mb-8 text-muted-foreground leading-relaxed">
          <p>{product.description}</p>
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Selecione uma opção
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant) => {
                const labelParts = [];
                if (variant.size) labelParts.push(variant.size);
                if (variant.color) labelParts.push(variant.color);
                
                const label = labelParts.length > 0 ? labelParts.join(" - ") : variant.sku;
                const isSelected = selectedVariant?.id === variant.id;
                
                return (
                  <Button
                    key={variant.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected ? "shadow-md scale-[1.02]" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <span className="font-semibold">{label}</span>
                    {Number(variant.priceAdjustment) !== 0 && (
                      <span className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {Number(variant.priceAdjustment) > 0 ? "+" : ""}
                        {formatter.format(Number(variant.priceAdjustment))}
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-border/50">
          {renderCTA()}
        </div>
      </div>
    </div>
  );
}
