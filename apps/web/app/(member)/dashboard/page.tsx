import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard | Sócio-Torcedor",
  description: "Seu painel de sócio.",
};

export default function MemberDashboardPage() {
  return (
    <div className="py-8">
      <DashboardClient />
    </div>
  );
}
