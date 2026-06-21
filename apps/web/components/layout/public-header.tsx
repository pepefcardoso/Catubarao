"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@repo/ui/components/sheet";
import { Menu, Waves } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const navItems = [
  { name: "Sócio-Torcedor", href: "/socio" },
  { name: "Portal de Transparência", href: "/transparencia" },
  { name: "Parceiros", href: "/parceiros" },
  { name: "Loja", href: "/loja" },
];

export function PublicHeader() {
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
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
          : "bg-transparent border-transparent",
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Waves className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight">Tubarão SAF</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              (pathname.startsWith(item.href) && item.href !== "/") || pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full">
              Entrar
            </Button>
          </Link>
          <Link href="/socio">
            <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              Seja Sócio
            </Button>
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <div className="flex flex-col gap-8 mt-8 h-full">
                <Link href="/" className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">Tubarão</span>
                </Link>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive =
                      (pathname.startsWith(item.href) && item.href !== "/") ||
                      pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex flex-col gap-4 mt-auto mb-8">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full rounded-xl" size="lg">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/socio" className="w-full">
                    <Button className="w-full rounded-xl shadow-lg shadow-primary/25" size="lg">
                      Seja Sócio
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
