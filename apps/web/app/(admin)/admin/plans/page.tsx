import { PlansClient } from "./plans-client";

export const metadata = {
  title: "Gerenciar Planos | Admin",
  description: "Gerenciar planos de sócio-torcedor",
};

export default function AdminPlansPage() {
  return <PlansClient />;
}
