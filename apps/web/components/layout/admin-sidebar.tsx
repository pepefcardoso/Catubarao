"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Shield, Receipt, LogOut, Settings, Calendar } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { MemberAvatar } from "../shared/MemberAvatar";

export const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Sócios", href: "/admin/members", icon: Users },
  { name: "Planos", href: "/admin/plans", icon: Shield },
  { name: "Eventos", href: "/admin/eventos", icon: Calendar },
  { name: "Financeiro", href: "/admin/finance", icon: Receipt },
  { name: "Transparência", href: "/admin/transparency", icon: Shield },
  { name: "Parceiros", href: "/parceiros", icon: Shield },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary/10 p-2 rounded-xl">
            <span className="text-primary font-bold">TS</span>
          </div>
          Tubarão Admin
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-secondary/50">
          <MemberAvatar size="sm" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">Administrador</span>
            <span className="text-xs text-muted-foreground truncate">admin@tubarao.com</span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
