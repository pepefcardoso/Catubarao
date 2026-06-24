"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "sonner";

export function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const resStats = await fetch(`${apiUrl}/stats/members`);
        if (resStats.ok) {
          const data = await resStats.json();
          setMemberCount(data.total);
        }
      } catch (err) {
        console.error("Failed to fetch member stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Check if the cursor is moving out of the top of the viewport
    // and ensure the user is on a desktop device (fine pointer)
    if (e.clientY <= 0 && window.matchMedia("(pointer: fine)").matches) {
      if (!sessionStorage.getItem("exit_intent_shown")) {
        setOpen(true);
        sessionStorage.setItem("exit_intent_shown", "true");
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "exit_intent" }),
      });
      if (res.ok) {
        setSuccess(true);
        toast.success("E-mail cadastrado com sucesso!");
        setTimeout(() => setOpen(false), 3000);
      } else {
        toast.error("Ocorreu um erro. Tente novamente mais tarde.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ainda pensando? O Tubarão precisa de você.</DialogTitle>
          <DialogDescription>
            {memberCount !== null
              ? `Já somos ${memberCount} sócios fazendo a diferença. Junte-se a nós!`
              : "Faça parte da nossa história e ajude a reconstruir o Tubarão."}
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center text-green-600 font-medium">
            Obrigado! Em breve entraremos em contato.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="exit-email">Seu melhor e-mail</Label>
              <Input
                id="exit-email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Receber lembrete"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
