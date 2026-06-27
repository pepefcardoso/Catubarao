"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, ShoppingBag, BarChart3, LogOut, User } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { MemberAvatar } from "../shared/MemberAvatar";

export const memberNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Meu Plano", href: "/plan", icon: CreditCard },
  { name: "Loja Exclusiva", href: "/loja", icon: ShoppingBag },
  { name: "Transparência", href: "/transparencia", icon: BarChart3 },
];

export function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <img src="/assets/logo.png" alt="Logo" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          Atlético Tubarão
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {memberNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            <span className="text-sm font-medium truncate">Sócio Torcedor</span>
            <span className="text-xs text-muted-foreground truncate">socio@tubarao.com</span>
          </div>
        </div>

        <Link href="/profile" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            Perfil
          </Button>
        </Link>
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
