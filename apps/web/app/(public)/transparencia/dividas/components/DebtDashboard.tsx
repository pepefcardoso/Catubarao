"use client";

import { useEffect, useState } from "react";
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
} from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Passivo Original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOriginal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Valor Negociado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNegotiated)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pago até o Momento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Saldo Devedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalRemaining)}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
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
                  <Line
                    type="monotone"
                    dataKey="totalRemaining"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
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
            <TableHeader>
              <TableRow>
                <TableHead>Credor / Grupo</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Valor Negociado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Restante</TableHead>
                <TableHead>Status</TableHead>
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
                        <div className="mt-1 text-xs italic text-muted-foreground">
                          Note: {debt.publicNote}
                        </div>
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
