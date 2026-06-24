"use client";

import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, AlertTriangle, Maximize, Share2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ClubCrest } from "@repo/ui/components/ClubCrest";
import html2canvas from "html2canvas";

const MOCK_MEMBER = {
  id: "123",
  name: "João Silva",
  subscriptionStatus: "ACTIVE", // Or SUSPENDED
  activePlanId: "plan-1",
  memberNumber: "1941-0001",
  tier: "OURO",
  subscription: {
    createdAt: "2023-01-15T00:00:00Z"
  }
};

const MOCK_CARD = {
  id: "card-1",
  qrToken: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6IjEyMyIsInBsYW5JZCI6InBsYW4tMSIsInRpZXIiOiJPVVJPIiwidmFsaWRVbnRpbCI6IjIwMjctMTItMzFUMjM6NTk6NTkuOTk5WiIsInN0YXR1cyI6IkFDVElWRSJ9.dummy_signature_for_testing",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

function getTierHue(tier: string) {
  switch (tier) {
    case "OURO": return "45deg";
    case "PRATA": return "0deg";
    case "BRONZE": return "-45deg";
    default: return "0deg";
  }
}

export function CardClient() {
  const [status, setStatus] = useState(MOCK_MEMBER.subscriptionStatus);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake Lock error:", err);
      }
    };
    requestWakeLock();

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, []);

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(console.error);
    } else {
      await document.exitFullscreen().catch(console.error);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(cardRef.current!, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: null 
        });
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], "carteirinha.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: "Minha Carteirinha",
                text: "Mostre com orgulho 📸",
              });
            } catch(e) {
              console.error("Share failed", e);
            }
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "carteirinha.png";
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsSharing(false);
        }, "image/png");
      } catch (err) {
        console.error("Error generating image", err);
        setIsSharing(false);
      }
    }, 150); // wait for blur render
  };

  const isSuspended = status === "SUSPENDED";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes pulse-shadow {
          0% { box-shadow: 0 0 15px rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 30px rgba(34,197,94,0.8); }
          100% { box-shadow: 0 0 15px rgba(34,197,94,0.4); }
        }
      `}} />

      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setStatus(status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}>
            Toggle Status
          </Button>
        </div>
      )}

      {/* Header */}
      {!isFullscreen && (
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-white hover:text-slate-300 transition-colors p-2 rounded-full bg-white/10 backdrop-blur-md">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-center font-bold text-lg tracking-wider opacity-80">
            SÓCIO-TORCEDOR
          </div>
          <div className="w-10" />
        </div>
      )}

      {/* Card Content Container */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 pb-12 ${isFullscreen ? 'pt-12' : ''}`}>
        
        {/* The Card */}
        <div 
          ref={cardRef}
          className={`relative w-full max-w-sm aspect-[5/8] sm:aspect-[9/16] rounded-[2rem] overflow-hidden flex flex-col p-6 text-white transition-all duration-300 ${isSuspended ? 'opacity-50' : ''}`}
          style={{
            boxShadow: isSuspended ? '0 0 20px rgba(100,100,100,0.5)' : 'none',
            animation: isSuspended ? 'none' : 'pulse-shadow 3s infinite',
            filter: isFullscreen ? 'brightness(1.3)' : 'none'
          }}
        >
          {/* Dynamic Background */}
          <div 
            className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-900 to-yellow-500"
            style={{
               background: "var(--brand-gradient, linear-gradient(135deg, #1e3a8a, #eab308))",
               filter: `hue-rotate(${getTierHue(MOCK_MEMBER.tier)})`
            }}
          />
          
          {/* Holographic Shimmer */}
          <div className="absolute inset-0 -z-10 pointer-events-none mix-blend-overlay overflow-hidden">
            <div 
              className="absolute inset-0 w-[200%] -left-[50%]"
              style={{
                background: "linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 60%, transparent 80%)",
                animation: "shimmer 3s ease-in-out infinite"
              }}
            />
          </div>

          {/* Top Row: Crest and Badge */}
          <div className="flex justify-between items-start mb-auto">
            <ClubCrest size={56} className="drop-shadow-lg" />
            <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-xl">
              {MOCK_MEMBER.tier}
            </Badge>
          </div>

          {/* Middle: Info */}
          <div className="mt-8 mb-6">
            <h1 className="font-display text-4xl font-black uppercase tracking-wide leading-tight drop-shadow-md">
              {MOCK_MEMBER.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-sm opacity-90 drop-shadow-sm">#{MOCK_MEMBER.memberNumber}</span>
              <span className="opacity-50 text-xs">•</span>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90 drop-shadow-sm">
                Sócio desde {new Date(MOCK_MEMBER.subscription.createdAt).getFullYear()}
              </span>
            </div>
          </div>

          {/* Bottom: QR Code and Validity */}
          <div className="flex justify-between items-end">
            <div className="bg-white p-3 rounded-2xl shadow-2xl relative overflow-hidden">
              <QRCodeSVG 
                value={isSuspended ? "SUSPENDED" : MOCK_CARD.qrToken} 
                size={120}
                level="H"
                includeMargin={false}
                style={{ filter: isSharing ? "blur(8px)" : "none", transition: "filter 0.2s" }}
              />
              {isSharing && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10">
                  <ClubCrest size={48} className="text-slate-400 opacity-80" />
                </div>
              )}
            </div>
            
            <div className="text-right flex flex-col justify-end h-[120px]">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-0.5 drop-shadow-sm">Válido até</p>
              <p className="font-mono text-sm font-semibold drop-shadow-sm">
                {new Date(MOCK_CARD.validUntil).toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Suspended Watermark */}
          {isSuspended && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="text-5xl font-black text-red-500/80 -rotate-45 tracking-widest border-8 border-red-500/80 px-6 py-3 rounded-xl backdrop-blur-sm">
                SUSPENSO
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isSuspended && !isFullscreen && (
          <div className="mt-8 flex gap-4 w-full max-w-sm flex-col sm:flex-row">
            <Button onClick={handleFullscreen} className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 border backdrop-blur-md">
              <Maximize className="w-4 h-4 mr-2" />
              Mostrar na entrada
            </Button>
            <Button onClick={handleShare} disabled={isSharing} className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 border backdrop-blur-md">
              <Share2 className="w-4 h-4 mr-2" />
              Mostre com orgulho 📸
            </Button>
          </div>
        )}

        {/* Exit fullscreen button */}
        {isFullscreen && (
          <div className="mt-8 flex justify-center w-full max-w-sm">
            <Button onClick={handleFullscreen} variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md">
              Sair da tela cheia
            </Button>
          </div>
        )}
      </div>
      
      {/* Club Colors Background Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
