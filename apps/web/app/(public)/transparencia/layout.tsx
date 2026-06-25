import { apiFetch } from "@/lib/api";
import { TransparencyPostResponse, AnnouncementBannerResponse } from "@repo/schemas/transparency";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Clock, AlertTriangle } from "lucide-react";
import { AnnouncementBanner } from "@/components/transparency/AnnouncementBanner";

export const revalidate = 3600; // 1 hour

async function getLatestPost() {
  try {
    const res = await apiFetch<{ posts: TransparencyPostResponse[] }>("/transparency/posts?limit=1", {
      next: { revalidate: 3600 },
    });
    return res.posts[0] || null;
  } catch (error) {
    console.error("Failed to fetch latest post for last updated indicator", error);
    return null;
  }
}

async function getAnnouncements() {
  try {
    const banners = await apiFetch<AnnouncementBannerResponse[]>("/transparency/announcements", {
      next: { revalidate: 300 }, // 5 mins
    });
    return banners || [];
  } catch (error) {
    console.error("Failed to fetch announcements", error);
    return [];
  }
}

export default async function TransparenciaLayout({ children }: { children: React.ReactNode }) {
  const [latestPost, announcements] = await Promise.all([
    getLatestPost(),
    getAnnouncements()
  ]);
  
  if (!latestPost) {
    return (
      <>
        {announcements.length > 0 && <AnnouncementBanner banners={announcements} />}
        {children}
      </>
    );
  }

  const publishedAt = new Date(latestPost.publishedAt);
  const now = new Date();
  
  // Calculate days difference
  const diffTime = Math.abs(now.getTime() - publishedAt.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const formattedDate = publishedAt.toLocaleDateString("pt-BR");

  return (
    <>
      {announcements.length > 0 && <AnnouncementBanner banners={announcements} />}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          {diffDays > 45 ? (
            <div className="py-4">
              <Alert variant="warning" className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                <AlertTriangle className="size-4" />
                <AlertTitle>Publicação pendente</AlertTitle>
                <AlertDescription>
                  A última atualização foi há {diffDays} dias.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="py-2 flex items-center justify-end text-xs text-muted-foreground gap-1.5">
              <Clock className="size-3.5" />
              <span>Portal atualizado em {formattedDate}</span>
            </div>
          )}
        </div>
      </div>
      {children}
    </>
  );
}
