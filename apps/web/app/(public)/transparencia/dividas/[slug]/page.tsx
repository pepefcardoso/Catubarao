import { notFound } from "next/navigation";
import { DebtStatusBadge } from "../components/DebtStatusBadge";
import { env } from "@/lib/env";
import { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

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
    day: "numeric"
  }).format(date);
}

async function getDebt(slug: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/transparency/debts/${slug}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch debt record");
  }
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const debt = await getDebt(resolvedParams.slug);
  if (!debt) return {};

  return {
    title: `Dívida: ${debt.creditorName} | Portal de Transparência`,
    description: `Acompanhe o status e pagamentos da dívida com ${debt.creditorName}.`,
    alternates: {
      canonical: `${env.NEXT_PUBLIC_APP_URL}/transparencia/dividas/${resolvedParams.slug}`,
    },
  };
}

export default async function DebtRecordPage({ params }: Props) {
  const resolvedParams = await params;
  const debt = await getDebt(resolvedParams.slug);

  if (!debt) {
    notFound();
  }

  const negotiated = debt.negotiatedAmount ?? debt.originalAmount;
  const remaining = Math.max(0, negotiated - debt.paidAmount);
  const percentPaid = negotiated > 0 ? Math.round((debt.paidAmount / negotiated) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{debt.creditorName}</h1>
          {debt.creditorGroup && (
            <p className="text-muted-foreground mt-1">{debt.creditorGroup}</p>
          )}
        </div>
        <DebtStatusBadge status={debt.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Valor Original</p>
          <p className="text-2xl font-black font-display tracking-tight mt-2">{formatCurrency(debt.originalAmount)}</p>
        </div>
        <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Valor Negociado</p>
          <p className="text-2xl font-black font-display tracking-tight mt-2">{formatCurrency(negotiated)}</p>
        </div>
        <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Status do Pagamento</p>
          <p className="text-2xl font-black font-display tracking-tight mt-2 text-emerald-600 dark:text-emerald-400">
            {percentPaid}% Pago
          </p>
        </div>
      </div>

      <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">Progresso do Pagamento</h2>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-all duration-1000" 
            style={{ width: `${percentPaid}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Pago</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(debt.paidAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Restante</p>
            <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(remaining)}</p>
          </div>
        </div>
      </div>

      {debt.publicNote && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h3 className="font-medium text-primary mb-2">Nota Pública</h3>
          <p className="text-sm text-foreground/80 leading-relaxed italic">"{debt.publicNote}"</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground pt-8 border-t">
        <p>Registro atualizado em: {formatDate(debt.updatedAt)}</p>
      </div>
    </div>
  );
}
