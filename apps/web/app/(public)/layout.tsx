import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { CookieBanner } from "@/components/cookie-banner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="main-content" className="flex-1 pt-16 md:pt-20">{children}</main>
      <PublicFooter />
      <CookieBanner />
    </div>
  );
}
