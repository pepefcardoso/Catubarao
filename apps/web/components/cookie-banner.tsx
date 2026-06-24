"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { CookieIcon } from "lucide-react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      const consent = localStorage.getItem("cookie-consent");
      if (!consent && !session?.user) {
        setIsVisible(true);
      }
    }
  }, [isPending, session]);

  const handleConsent = (type: "all" | "essential") => {
    localStorage.setItem("cookie-consent", type);
    setIsVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-4 backdrop-blur-lg sm:p-6">
      <div className="container mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 hidden rounded-full bg-primary/10 p-2 sm:block">
            <CookieIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Sua privacidade</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Utilizamos cookies para melhorar sua experiência e para fins de conformidade com a LGPD.
              Para mais detalhes, acesse nossa{" "}
              <Link href="/privacidade" className="underline hover:text-foreground">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleConsent("essential")}>
            Apenas essenciais
          </Button>
          <Button onClick={() => handleConsent("all")}>Aceitar todos</Button>
        </div>
      </div>
    </div>
  );
}
