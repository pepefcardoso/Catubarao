"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Receipt, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

// Assuming we have an auth-client to fetch authenticated fetch/session or use generic fetch.
import { useSession } from "@/lib/auth-client";

export function PaymentsClient() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchPayments() {
      if (!session) return;
      try {
        setLoading(true);
        setError(null);
        // Using relative internal API if proxy is set up or full url
        // Here we just hit the api through Next.js proxy if it exists or env.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/members/me/payments?page=${page}&limit=10`, {
          headers: {
            "Content-Type": "application/json",
            // Assuming Better Auth uses cookies for auth or requires bearer token.
            // If it relies on cookies, fetch includes them by default if same-origin, 
            // but we'll add credentials: "include" just in case if it's cross-origin.
          },
          credentials: "omit", // or "include" depending on auth setup. Usually Better Auth relies on fetch wrapper. Let's rely on standard fetch and if it fails, fallback to something else.
        });
        
        // Actually Better Auth usually provides an authenticated fetch client, but standard fetch works if cookies are set and it's same origin.
        if (!res.ok) {
          throw new Error("Falha ao carregar pagamentos");
        }
        const data = await res.json();
        setPayments(data.data);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [page, session]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Pago</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pendente</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Falhou</Badge>;
      case "REFUNDED":
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "PIX":
        return "Pix";
      case "CREDIT_CARD":
        return "Cartão de Crédito";
      default:
        return method;
    }
  };

  if (loading && payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10 mt-4">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={() => setPage(1)}>Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <Receipt className="h-12 w-12 text-muted-foreground opacity-50" />
          <div>
            <h3 className="font-semibold text-lg">Nenhum pagamento encontrado</h3>
            <p className="text-muted-foreground mt-1">
              Você ainda não possui histórico de pagamentos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(payment.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </TableCell>
                <TableCell>{getMethodText(payment.method)}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(payment.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-right">
                  {payment.gatewayPaymentId && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://www.mercadopago.com.br/receipt/status?payment_id=${payment.gatewayPaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver recibo
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
