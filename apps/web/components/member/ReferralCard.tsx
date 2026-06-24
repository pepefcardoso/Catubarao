"use client";

import { useState, useEffect } from "react";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { copy } from "@/lib/copy";
import { apiFetch } from "@/lib/api";

type ReferralData = {
  code: string | null;
  successfulReferrals: number;
  pointsEarned: number;
};

export function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<ReferralData>("/members/me/referral")
      .then((data) => setData(data))
      .catch(console.error);
  }, []);

  if (!data || !data.code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = `${window.location.origin}/signup`;
  const message = copy.dashboard.referralShareMessage(shareUrl, data.code);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Indique e Ganhe</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Compartilhe seu código com amigos e ganhe Escudos para trocar por benefícios.
      </p>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-muted rounded-md p-3 font-mono text-center border text-lg tracking-wider">
          {data.code}
        </div>
        <Button variant="outline" size="icon" onClick={handleCopy} className="h-12 w-12 shrink-0">
          <Copy className="h-5 w-5" />
          <span className="sr-only">Copiar código</span>
        </Button>
      </div>
      
      {copied && (
        <p className="text-sm text-green-600 font-medium mb-4 text-center">Copiado!</p>
      )}

      <Button asChild className="w-full mb-4" variant="default">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar no WhatsApp
        </a>
      </Button>

      <div className="text-sm text-center border-t pt-4 mt-2">
        <span className="font-medium text-foreground">Você indicou {data.successfulReferrals} amigos</span>
        <span className="mx-2 text-muted-foreground">•</span>
        <span className="font-medium text-green-600">+ {data.pointsEarned} Escudos ganhos</span>
      </div>
    </div>
  );
}
