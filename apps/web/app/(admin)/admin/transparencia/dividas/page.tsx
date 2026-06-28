"use client";

import { DebtAdminDashboard } from "./components/DebtAdminDashboard";

export default function AdminDebtsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Gestão de Dívidas
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie o passivo do clube, atualize valores e gere snapshots históricos.
        </p>
      </div>

      <DebtAdminDashboard />
    </div>
  );
}
