"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { apiFetch } from "@/lib/api";
import { X } from "lucide-react";
import { WhatsAppIcon } from "../icons/WhatsAppIcon"; // Adjusted import path

export function WhatsAppOptInPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkEligibility() {
      try {
        const me = await apiFetch<any>("/members/me");
        
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const isEligible =
          !me.whatsappOptIn &&
          !me.whatsappOptInDismissedAt &&
          Date.now() - new Date(me.createdAt).getTime() > SEVEN_DAYS_MS;

        setIsVisible(isEligible);
      } catch (error) {
        console.error("Failed to check WhatsApp opt-in eligibility:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkEligibility();
  }, []);

  const handleOptIn = async () => {
    // Optimistic UI
    setIsVisible(false);
    try {
      await apiFetch("/members/me", {
        method: "PATCH",
        body: JSON.stringify({ whatsappOptIn: true }),
      });
    } catch (error) {
      console.error("Failed to opt-in:", error);
      setIsVisible(true); // Revert on error
    }
  };

  const handleDismiss = async () => {
    // Optimistic UI
    setIsVisible(false);
    try {
      await apiFetch("/members/me", {
        method: "PATCH",
        body: JSON.stringify({ whatsappOptInDismissedAt: new Date().toISOString() }),
      });
    } catch (error) {
      console.error("Failed to dismiss opt-in:", error);
      setIsVisible(true); // Revert on error
    }
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <Card className="mb-6 relative overflow-hidden border-primary/20 bg-primary/5">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-primary/10"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </Button>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
          Quer receber novidades do Tubarão pelo WhatsApp?
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Fique por dentro das novidades, eventos e comunicados importantes do clube diretamente no seu WhatsApp.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0" 
            onClick={handleOptIn}
          >
            Sim, quero!
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
          >
            Agora não
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
