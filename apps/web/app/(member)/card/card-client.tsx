"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

// Mock Data for testing the UI
const MOCK_MEMBER = {
  id: "123",
  name: "João Silva",
  subscriptionStatus: "ACTIVE", // Or SUSPENDED
  activePlanId: "plan-1",
  memberNumber: "1941-0001",
};

const MOCK_CARD = {
  id: "card-1",
  qrToken: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6IjEyMyIsInBsYW5JZCI6InBsYW4tMSIsInRpZXIiOiJPVVJPIiwidmFsaWRVbnRpbCI6IjIwMjctMTItMzFUMjM6NTk6NTkuOTk5WiIsInN0YXR1cyI6IkFDVElWRSJ9.dummy_signature_for_testing",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export function CardClient() {
  const [status, setStatus] = useState(MOCK_MEMBER.subscriptionStatus);

  useEffect(() => {
    // Boost brightness on this page
    document.body.style.filter = "brightness(1.2)";

    // Request wake lock to keep screen on
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

    return () => {
      document.body.style.filter = "none";
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, []);

  const isSuspended = status === "SUSPENDED";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Dev toggle */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setStatus(status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}>
            Toggle Status
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-white hover:text-slate-300 transition-colors p-2 rounded-full bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="text-center font-bold text-lg tracking-wider opacity-80">
          SÓCIO-TORCEDOR
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-12">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          {/* Member Info */}
          <div className="mb-10 text-center space-y-3">
            <h1 className="text-4xl font-bold uppercase tracking-wide leading-tight">{MOCK_MEMBER.name}</h1>
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground border-none px-4 py-1.5 text-sm font-semibold tracking-wide">
                OURO
              </Badge>
              <span className="text-slate-300 font-mono text-lg opacity-80">#{MOCK_MEMBER.memberNumber}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative">
            <div className={`bg-white p-4 rounded-[2rem] shadow-2xl transition-opacity duration-300 ${isSuspended ? "opacity-30" : "opacity-100"}`}>
              <QRCodeSVG 
                value={isSuspended ? "SUSPENDED" : MOCK_CARD.qrToken} 
                size={280}
                level="H"
                includeMargin={false}
              />
            </div>
            
            {/* Suspended Overlay */}
            {isSuspended && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="bg-red-500/20 p-4 rounded-full mb-3 backdrop-blur-md">
                  <AlertTriangle className="w-12 h-12 text-red-500 drop-shadow-md" />
                </div>
                <div className="bg-black/80 px-6 py-4 rounded-2xl backdrop-blur-md border border-red-500/50 max-w-[80%] shadow-2xl">
                  <p className="font-bold text-lg text-white mb-1">Assinatura Suspensa</p>
                  <p className="text-sm text-red-200">Regularize sua situação para liberar a carteirinha.</p>
                </div>
              </div>
            )}
          </div>

          {/* Validity */}
          {!isSuspended && (
            <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">Válido até</p>
              <p className="text-2xl font-mono mt-1 opacity-90">
                {new Date(MOCK_CARD.validUntil).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Club Colors Background Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
