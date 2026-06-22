"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyOfflineToken } from "@/lib/offline-validator";
import { queueCheckin, syncOfflineCheckins } from "@/lib/sync-queue";
import { toast } from "sonner";

export default function Scanner({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<"IDLE" | "VALID" | "INVALID">("IDLE");
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Syncing check-ins...");
      syncOfflineCheckins(eventId);
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline. Check-ins will be queued.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    if (navigator.onLine) {
      syncOfflineCheckins(eventId);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [eventId]);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          if (scannerRef.current) {
            scannerRef.current.pause(true);
          }
          
          try {
            const result = await verifyOfflineToken(decodedText);
            if (result.isValid) {
              setStatus("VALID");
              setMessage(`Valid Ticket: ${result.payload?.memberId?.toString().substring(0, 8)}...`);
              await queueCheckin(decodedText);
              
              if (navigator.onLine) {
                syncOfflineCheckins(eventId);
              }
            } else {
              setStatus("INVALID");
              setMessage(`Invalid: ${result.error}`);
            }
          } catch (err: any) {
            setStatus("INVALID");
            setMessage("Invalid QR Code format.");
          }
          
          setTimeout(() => {
            setStatus("IDLE");
            setMessage("");
            if (scannerRef.current) {
              scannerRef.current.resume();
            }
          }, 3000);
        },
        (error) => {
          // Ignore
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [eventId]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      status === "VALID" ? "bg-green-600 text-white" : 
      status === "INVALID" ? "bg-red-600 text-white" : "bg-zinc-950 text-white"
    }`}>
      
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
        <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
      </div>

      <h1 className="text-2xl font-bold mb-8">Stadium Validator</h1>
      
      <div className="w-full max-w-sm bg-white text-black p-4 rounded-xl overflow-hidden shadow-2xl mb-8">
        <div id="qr-reader" className="w-full"></div>
      </div>

      <div className="h-24 flex items-center justify-center text-center">
        {status === "IDLE" && <p className="text-xl text-zinc-400">Point camera at QR code</p>}
        {status === "VALID" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">VALID</h2>
            <p className="text-lg opacity-90">{message}</p>
          </div>
        )}
        {status === "INVALID" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">INVALID</h2>
            <p className="text-lg opacity-90">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
