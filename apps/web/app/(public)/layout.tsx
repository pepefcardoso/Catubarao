import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { CookieBanner } from "@/components/cookie-banner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <PublicFooter />
      <CookieBanner />
    </div>
  );
}
