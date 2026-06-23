import { PedidosClient } from "./pedidos-client";

export const metadata = {
  title: "Meus Pedidos | Sócio-Torcedor",
  description: "Histórico de compras na loja oficial.",
};

export default function PedidosPage() {
  return (
    <div className="py-8">
      <PedidosClient />
    </div>
  );
}
