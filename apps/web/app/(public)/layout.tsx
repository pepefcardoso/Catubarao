import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { CookieBanner } from "@/components/cookie-banner";
import { AnnouncementBanner } from "@repo/ui/components/AnnouncementBanner";
import { apiFetch } from "@/lib/api";
import { AnnouncementBannerResponse } from "@repo/schemas/banner";

async function getAnnouncements() {
  try {
    const banners = await apiFetch<AnnouncementBannerResponse[]>("/announcements?type=ANNOUNCEMENT", {
      next: { revalidate: 60 },
    });
    return banners || [];
  } catch (error) {
    console.error("Failed to fetch announcements", error);
    return [];
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const announcements = await getAnnouncements();

  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Pular para o conteúdo
      </a>
      <AnnouncementBanner banners={announcements} />
      <PublicHeader />
      <main id="main-content" className="flex-1 pt-16 md:pt-20">{children}</main>
      <PublicFooter />
      <CookieBanner />
    </div>
  );
}
