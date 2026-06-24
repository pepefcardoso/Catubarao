"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { QrCode, AlertCircle, CheckCircle, ChevronRight, History, Settings, UserPlus, FileText } from "lucide-react";
import Link from "next/link";
import { env } from "@/lib/env";
import { useSession } from "@/lib/auth-client";
import { copy } from "@/lib/copy";
import { ReferralCard } from "@/components/member/ReferralCard";

// Mock Data for testing the UI
const MOCK_MEMBER = {
  id: "123",
  name: "João Silva",
  subscriptionStatus: "ACTIVE", // Can be toggled to PENDING or SUSPENDED for testing
  activePlanId: "plan-1",
};

const MOCK_CARD = {
  id: "card-1",
  qrToken: "mock-qr-token-12345",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const MOCK_POINTS = {
  totalPoints: 1250,
  events: [
    { id: "e1", type: "CHECKIN", points: 50, createdAt: new Date().toISOString() },
    { id: "e2", type: "STREAK_6M", points: 500, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "e3", type: "REFERRAL", points: 200, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "e4", type: "CHECKIN", points: 50, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "e5", type: "CHECKIN", points: 50, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  ],
};

const MOCK_POLLS = [
  { id: "poll-1", title: "Novo Design da Camisa 2026", status: "OPEN", closesAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
];

export function DashboardClient() {
  const { data: session } = useSession();
  const userName = session?.user?.name || MOCK_MEMBER.name;
  const [status, setStatus] = useState<string>("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Dev toggle for testing states */}
      {process.env.NODE_ENV === "development" && (
        <div className="flex gap-2 p-4 bg-muted rounded-md mb-6">
          <span className="text-sm font-semibold flex items-center mr-2">Dev: Test Status</span>
          <Button variant="outline" size="sm" onClick={() => setStatus("ACTIVE")}>ACTIVE</Button>
          <Button variant="outline" size="sm" onClick={() => setStatus("PENDING")}>PENDING</Button>
          <Button variant="outline" size="sm" onClick={() => setStatus("SUSPENDED")}>SUSPENDED</Button>
        </div>
      )}

      {/* Subscription Banner */}
      <StatusBanner status={status} />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Card Preview Widget - Hidden if SUSPENDED */}
          {status !== "SUSPENDED" && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{copy.dashboard.welcome(userName, "50,00", "150.000,00")}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Sócio-Torcedor</Badge>
                    <span className="text-sm text-muted-foreground">Válido até: {new Date(MOCK_CARD.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm hidden sm:block">
                  <QrCode className="w-20 h-20 text-black" />
                </div>
              </CardContent>
              <CardFooter className="bg-primary/5 px-6 py-3 border-t border-primary/10">
                <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-primary/10" asChild>
                  <Link href="/card">
                    Ver carteirinha completa
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Points & Gamification */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Meus Pontos</CardTitle>
                <div className="text-3xl font-bold text-primary">{MOCK_POINTS.totalPoints}</div>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Últimos eventos</h4>
              <div className="space-y-4">
                {MOCK_POINTS.events.map(event => (
                  <div key={event.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{event.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                      +{event.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">Ver Histórico Completo</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Links Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 divide-y">
                <QuickLink href="/payments" icon={<History className="w-5 h-5" />} label="Histórico de Pagamentos" />
                <QuickLink href="/profile" icon={<Settings className="w-5 h-5" />} label="Configurações do Perfil" />
                <QuickLink href="/referrals" icon={<UserPlus className="w-5 h-5" />} label="Indique um Amigo" />
              </div>
            </CardContent>
          </Card>

          <ReferralCard />

          {/* Polls Widget */}
          {MOCK_POLLS.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Votações Abertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_POLLS.map(poll => (
                  <div key={poll.id} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold mb-1">{poll.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">Encerra em: {new Date(poll.closesAt).toLocaleDateString()}</p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Votar Agora</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return (
      <div className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="font-bold">Sua assinatura está Ativa!</h3>
          <p className="text-sm">Obrigado por fazer parte do Sócio-Torcedor.</p>
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-bold">Pagamento Pendente</h3>
            <p className="text-sm">Aguardando a confirmação do pagamento para liberar sua carteirinha.</p>
          </div>
        </div>
        <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0">
          Realizar Pagamento
        </Button>
      </div>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <div className="bg-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-bold">Assinatura Suspensa</h3>
            <p className="text-sm">{copy.dashboard.delinquencyBanner}</p>
          </div>
        </div>
        <Button variant="destructive" className="shrink-0">
          Regularizar Débitos
        </Button>
      </div>
    );
  }

  return null;
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground transition-colors">
        {icon}
        {label}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}
