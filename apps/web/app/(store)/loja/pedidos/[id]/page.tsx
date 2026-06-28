import { PedidoDetailClient } from "./pedido-detail-client";

export const metadata = {
  title: "Detalhes do Pedido | Sócio-Torcedor",
  description: "Acompanhe o status e detalhes do seu pedido.",
};

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-8 bg-muted/30 min-h-screen">
      <PedidoDetailClient id={id} />
    </div>
  );
}
