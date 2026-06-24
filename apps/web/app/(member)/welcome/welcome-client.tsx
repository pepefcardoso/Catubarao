"use client";

import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { copy } from "@/lib/copy";
import { env } from "@/lib/env";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ClubCrest } from "@repo/ui/components/ClubCrest";
import { Copy, Camera, Share2, ArrowRight } from "lucide-react";

interface WelcomeClientProps {
  member: any;
}

export function WelcomeClient({ member }: WelcomeClientProps) {
  const router = useRouter();
  const [showDashboardBtn, setShowDashboardBtn] = useState(false);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!confettiFired.current) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00FF00', '#000000', '#FFFFFF'] // Mock brand colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00FF00', '#000000', '#FFFFFF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      confettiFired.current = true;
    }

    const timer = setTimeout(() => {
      setShowDashboardBtn(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const signupUrl = `${env.NEXT_PUBLIC_APP_URL || "https://tubaraosaf.com"}/signup`;
  const shareMessage = copy.welcome.shareMessage(signupUrl, member.referralCode || "");

  const handleCopyInstagram = () => {
    navigator.clipboard.writeText(shareMessage);
    toast.success("Texto copiado! Cole no seu story do Instagram.");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(member.referralCode || "");
    toast.success("Código copiado!");
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 text-center px-4">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl text-brand-primary" style={{ fontFamily: "var(--font-display)" }}>
          {copy.welcome.title(member.name, member.memberNumber || "---")}
        </h1>
      </div>

      <div className="flex justify-center">
        {/* Static Membership Card Mock */}
        <Card className="w-80 h-48 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border-brand-primary/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 left-4">
            <ClubCrest size={40} className="text-brand-primary" />
          </div>
          <div className="absolute top-4 right-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {member.activePlanName || "Sócio-Torcedor"}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 text-left">
            <div className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {member.name}
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              Nº {member.memberNumber ? member.memberNumber.toString().padStart(6, '0') : "000000"}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">
            {copy.welcome.referralCta(500)} {/* Assuming 500 Escudos for example */}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <code className="bg-muted px-4 py-2 rounded-md font-mono text-lg font-bold tracking-widest border">
              {member.referralCode || "N/A"}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copiar código">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full bg-[#25D366] hover:bg-[#1da851] text-white" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Share2 className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white border-0" onClick={handleCopyInstagram}>
            <Camera className="w-4 h-4 mr-2" />
            Instagram
          </Button>
        </div>
      </div>

      <div className="h-16 flex items-center justify-center pt-8">
        {showDashboardBtn && (
          <Button 
            variant="ghost" 
            className="text-brand-primary hover:text-brand-primary/80"
            onClick={() => router.push("/dashboard")}
          >
            Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
