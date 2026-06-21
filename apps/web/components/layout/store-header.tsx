"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@repo/ui/components/sheet";
import { Menu, Waves, ShoppingBag, User, Search } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const storeCategories = [
  { name: "Lançamentos", href: "/loja/lancamentos" },
  { name: "Uniformes", href: "/loja/uniformes" },
  { name: "Treino", href: "/loja/treino" },
  { name: "Acessórios", href: "/loja/acessorios" },
  { name: "Infantil", href: "/loja/infantil" },
  { name: "Sócio-Torcedor", href: "/loja/socio" },
];

export function StoreHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 flex flex-col bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      {/* Top Bar - Notifications / Offers */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-medium">
        Frete grátis para todo o Brasil nas compras acima de R$ 299,00
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetTitle className="sr-only">Menu da Loja</SheetTitle>
                <div className="flex flex-col gap-6 mt-6 h-full">
                  <Link href="/loja" className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-xl">
                      <Waves className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Tubarão Store</span>
                  </Link>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Buscar produtos..."
                      className="w-full pl-9 pr-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <nav className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                      Categorias
                    </h4>
                    {storeCategories.map((category) => {
                      const isActive = pathname === category.href;
                      return (
                        <Link
                          key={category.href}
                          href={category.href}
                          className={cn(
                            "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                          )}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/loja" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 md:p-2 rounded-xl group-hover:bg-primary/90 transition-colors">
              <Waves className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">
              Tubarão Store
            </span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="O que você está procurando?"
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 hover:bg-secondary focus:bg-background border border-transparent focus:border-primary/30 rounded-full text-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/loja/conta">
            <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
              <User className="w-5 h-5" />
              <span className="sr-only">Minha Conta</span>
            </Button>
          </Link>

          <Link href="/loja/carrinho">
            <Button
              variant="outline"
              className="rounded-full relative border-border/50 hover:bg-secondary"
            >
              <ShoppingBag className="w-5 h-5 mr-0 md:mr-2" />
              <span className="hidden md:inline font-medium">Carrinho</span>
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop Categories Nav */}
      <div className="hidden md:flex items-center justify-center border-t border-border/50 bg-background/50 h-12">
        <nav className="flex items-center gap-6">
          {storeCategories.map((category) => {
            const isActive = pathname === category.href;
            return (
              <Link
                key={category.href}
                href={category.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-primary border-b-2 border-primary pb-3 mt-3"
                    : "text-muted-foreground",
                )}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
