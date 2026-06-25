"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { memberNavItems } from "./member-sidebar";
import { MemberAvatar } from "../shared/MemberAvatar";

export function MemberHeader() {
  const pathname = usePathname();
  const currentItem = memberNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col p-0">
            <SheetTitle className="sr-only">Navegação do Membro</SheetTitle>
            <div className="p-6 border-b">
              <SheetClose asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 font-bold text-xl tracking-tight"
                >
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <span className="text-primary font-bold">TS</span>
                  </div>
                  Tubarão SAF
                </Link>
              </SheetClose>
            </div>

            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {memberNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            <div className="p-4 border-t space-y-2 bg-muted/20">
              <div className="flex items-center gap-3 px-3 py-2 mb-4 rounded-lg bg-background border shadow-sm">
                <MemberAvatar size="md" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">Sócio Torcedor</span>
                  <span className="text-xs text-muted-foreground truncate">socio@tubarao.com</span>
                </div>
              </div>

              <SheetClose asChild>
                <Link href="/profile" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </Button>
                </Link>
              </SheetClose>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Page Title for Desktop/Tablet */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            {currentItem?.name || "Dashboard"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Right side header actions (e.g., Notifications) could go here */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
