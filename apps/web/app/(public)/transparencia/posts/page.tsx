import { Suspense } from "react";
import { FilterBar } from "./filter-bar";
import { Pagination } from "./pagination";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import { TransparencyPostResponse } from "@repo/schemas/transparency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@repo/ui/components/skeleton";

export const revalidate = 0; // Dynamic route

const CATEGORY_LABELS: Record<string, string> = {
  BALANCO_MENSAL: "Balanço Mensal",
  STATUS_DIVIDAS: "Status de Dívidas",
  ATA_ASSEMBLEIA: "Ata de Assembleia",
  COMPOSICAO_SOCIETARIA: "Composição Societária",
  DOCUMENTO_SAF: "Documento SAF",
  OUTRO: "Outros",
};

async function fetchPosts(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();
  
  if (searchParams.page) params.set('page', searchParams.page as string);
  if (searchParams.referenceYear) params.set('referenceYear', searchParams.referenceYear as string);
  
  if (searchParams.category) {
    const categories = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
    categories.forEach(c => params.append('category', c));
  }

  const res = await apiFetch<{ posts: TransparencyPostResponse[], total: number, page: number, limit: number }>(
    `${env.NEXT_PUBLIC_API_URL}/transparency/posts?${params.toString()}`,
    { cache: "no-store" }
  );
  return res;
}

function PostSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse bg-card/50">
          <CardHeader className="pb-3 space-y-2">
            <Skeleton className="h-6 w-2/3 bg-muted" />
            <Skeleton className="h-4 w-1/4 bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-4/5 mt-2 bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed flex flex-col items-center justify-center">
      <FileText className="size-10 mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium text-foreground mb-1">Nenhum documento encontrado</h3>
      <p className="text-sm">Tente ajustar ou limpar os filtros para ver mais resultados.</p>
    </div>
  );
}

async function PostList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const data = await fetchPosts(searchParams);

  if (!data || data.posts.length === 0) {
    return <EmptyState />;
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {data.posts.map(post => {
          const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
          const dateLabel = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(post.publishedAt));
          
          let refLabel = null;
          if (post.referenceMonth && post.referenceYear) {
            const date = new Date(post.referenceYear, post.referenceMonth - 1);
            refLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
            refLabel = refLabel.charAt(0).toUpperCase() + refLabel.slice(1);
          } else if (post.referenceYear) {
            refLabel = post.referenceYear.toString();
          }

          return (
            <Link href={`/transparencia/${post.id}`} key={post.id} className="block group">
              <Card className="group-hover:border-primary/50 transition-colors bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 w-fit">
                      {categoryLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CardDescription>{dateLabel}</CardDescription>
                    {refLabel && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-foreground/80">Ref: {refLabel}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <Pagination page={data.page} totalPages={totalPages} />
    </div>
  );
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // In Next.js 15, searchParams is a Promise
  const params = await searchParams;
  
  const currentCategories = Array.isArray(params.category) ? params.category : (params.category ? [params.category] : []);
  const currentYear = params.referenceYear as string | undefined;

  // Use a stable key for Suspense based on search parameters to trigger re-renders of the Suspense boundary on navigation
  const suspenseKey = new URLSearchParams(params as any).toString();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-extrabold tracking-tight">Documentos e Relatórios</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Acesse todos os balanços, atas e documentos publicados pelo clube.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterBar currentCategories={currentCategories} currentYear={currentYear} />
          </div>
          <div className="lg:col-span-3">
            <Suspense key={suspenseKey} fallback={<PostSkeleton />}>
              <PostList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
