import { Suspense } from "react";
import { CheckoutClient } from "./checkout-client";

export const metadata = {
  title: "Checkout - Loja Tubarão",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Finalizar Compra</h1>
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-muted-foreground">Carregando informações do checkout...</div>}>
        <CheckoutClient />
      </Suspense>
    </div>
  );
}
