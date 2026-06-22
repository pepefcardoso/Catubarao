import { PaymentsClient } from "./payments-client";

export const metadata = {
  title: "Histórico de Pagamentos | Sócio-Torcedor",
  description: "Seu histórico de pagamentos e mensalidades.",
};

export default function MemberPaymentsPage() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Pagamentos</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o histórico e a situação das suas mensalidades.
        </p>
      </div>
      <PaymentsClient />
    </div>
  );
}
