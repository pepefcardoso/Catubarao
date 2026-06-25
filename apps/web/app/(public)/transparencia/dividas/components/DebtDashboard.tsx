"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowDown, ArrowUp } from "lucide-react";
import { DebtStatusBadge } from "./DebtStatusBadge";
import { EmptyState } from "./EmptyState";
import { DebtRecordResponse, DebtSnapshotResponse } from "@repo/schemas/transparency";
import { env } from "@/lib/env";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateInput: string | Date) {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(date);
}

const STATUS_ORDER = {
  ATRASADO: 1,
  EM_NEGOCIACAO: 2,
  EM_DIA: 3,
  QUITADO: 4,
};

export function DebtDashboard() {
  const [debts, setDebts] = useState<Record<string, DebtRecordResponse[]>>({});
  const [snapshots, setSnapshots] = useState<DebtSnapshotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [debtsRes, snapshotsRes] = await Promise.all([
          fetch(`${env.NEXT_PUBLIC_API_URL}/transparency/debts`),
          fetch(`${env.NEXT_PUBLIC_API_URL}/transparency/debts/snapshots`),
        ]);
        
        if (debtsRes.ok) {
          const debtsData = await debtsRes.json();
          setDebts(debtsData);
        }
        
        if (snapshotsRes.ok) {
          const snapshotsData = await snapshotsRes.json();
          setSnapshots(snapshotsData.sort((a: any, b: any) => new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()));
        }
      } catch (error) {
        console.error("Failed to fetch debts data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="w-24 h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-8" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="w-full h-[400px]" />
        <Skeleton className="w-full h-[400px]" />
      </div>
    );
  }

  const allDebts = Object.values(debts).flat();

  if (allDebts.length === 0) {
    return <EmptyState />;
  }

  const totalOriginal = allDebts.reduce((acc, curr) => acc + curr.originalAmount, 0);
  const totalNegotiated = allDebts.reduce((acc, curr) => acc + (curr.negotiatedAmount ?? curr.originalAmount), 0);
  const totalPaid = allDebts.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalRemaining = totalNegotiated - totalPaid;
  const numCreditors = allDebts.length;
  const percentPaid = totalNegotiated > 0 ? Math.round((totalPaid / totalNegotiated) * 100) : 0;

  const sortedDebts = [...allDebts].sort((a, b) => {
    const statusA = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] || 99;
    const statusB = STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] || 99;
    return statusA - statusB;
  });

  const chartData = snapshots.map((s) => ({
    name: formatDate(s.snapshotDate),
    totalRemaining: s.totalRemaining,
  }));

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4" aria-live="polite" aria-atomic="true">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-display tracking-tight">{formatCurrency(totalOriginal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black font-display tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalPaid)}
              </div>
              <ArrowUp className="w-4 h-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black font-display tracking-tight text-red-600 dark:text-red-400">
                {formatCurrency(totalRemaining)}
              </div>
              <ArrowDown className="w-4 h-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Número de Credores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-display tracking-tight">
              {numCreditors}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/20">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">Progresso da Reestruturação</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Acompanhe o percentual da dívida que já foi quitada graças ao apoio dos sócios e à responsabilidade fiscal do clube.
              </p>
            </div>
            <div className="mt-6 md:mt-0 relative flex items-center justify-center shrink-0" ref={chartRef}>
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/30"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={(2 * Math.PI * 56) * (1 - (isVisible ? percentPaid : 0) / 100)}
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black font-display">{isVisible ? percentPaid : 0}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Chart */}
      {snapshots.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Passivo Total ao Longo do Tempo</CardTitle>
            <CardDescription>
              Evolução histórica do saldo devedor consolidado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-sm text-muted-foreground fill-current"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                    className="text-sm text-muted-foreground fill-current"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), "Saldo Devedor"]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRemaining"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRemaining)"
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creditors Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Detalhamento por Credor</CardTitle>
              <CardDescription>
                Relação completa de dívidas e seus respectivos status
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground mr-2 text-xs uppercase tracking-wider font-semibold">Legenda:</span>
              <DebtStatusBadge status="ATRASADO" />
              <DebtStatusBadge status="EM_NEGOCIACAO" />
              <DebtStatusBadge status="EM_DIA" />
              <DebtStatusBadge status="QUITADO" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="sr-only">Dívidas e Credores</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Credor / Grupo</TableHead>
                <TableHead scope="col">Valor Original</TableHead>
                <TableHead scope="col">Valor Negociado</TableHead>
                <TableHead scope="col">Pago</TableHead>
                <TableHead scope="col">Restante</TableHead>
                <TableHead scope="col">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDebts.map((debt) => {
                const negotiated = debt.negotiatedAmount ?? debt.originalAmount;
                const remaining = negotiated - debt.paidAmount;
                return (
                  <TableRow key={debt.id}>
                    <TableCell>
                      <div className="font-medium">{debt.creditorName}</div>
                      {debt.creditorGroup && (
                        <div className="text-xs text-muted-foreground">
                          {debt.creditorGroup}
                        </div>
                      )}
                      {debt.publicNote && (
                        <blockquote className="mt-2 border-l-2 border-primary/50 pl-3 italic text-xs text-muted-foreground bg-muted/30 py-1.5 px-2 rounded-r-md">
                          "{debt.publicNote}"
                        </blockquote>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(debt.originalAmount)}</TableCell>
                    <TableCell>{formatCurrency(negotiated)}</TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(debt.paidAmount)}
                    </TableCell>
                    <TableCell className="font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(remaining)}
                    </TableCell>
                    <TableCell>
                      <DebtStatusBadge status={debt.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
