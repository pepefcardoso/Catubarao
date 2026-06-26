import { notFound } from "next/navigation";
import { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import { TransparencyPostResponse } from "@repo/schemas/transparency";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ImmutabilityBadge } from "@/components/transparency/ImmutabilityBadge";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Download, FileText, ArrowLeft, History, TriangleAlert } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 300; // 5 minutes

const CATEGORY_LABELS: Record<string, string> = {
  BALANCO_MENSAL: "Balanço Mensal",
  STATUS_DIVIDAS: "Status de Dívidas",
  ATA_ASSEMBLEIA: "Ata de Assembleia",
  COMPOSICAO_SOCIETARIA: "Composição Societária",
  DOCUMENTO_SAF: "Documento SAF",
  OUTRO: "Outros",
};

async function getPost(id: string) {
  try {
    const res = await apiFetch<TransparencyPostResponse>(
      `${env.NEXT_PUBLIC_API_URL}/transparency/posts/${id}`,
      { next: { revalidate: 3600 } }
    );
    return res;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Documento não encontrado",
    };
  }

  const plainTextBody = post.body.replace(/<\/?[^>]+(>|$)/g, "").replace(/[#*`~_\[\]()]/g, "").trim();
  const description = plainTextBody.substring(0, 160) + (plainTextBody.length > 160 ? "..." : "");

  return {
    title: `${post.title} | Portal de Transparência`,
    description,
    alternates: {
      canonical: `${env.NEXT_PUBLIC_APP_URL}/transparencia/posts/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `${env.NEXT_PUBLIC_APP_URL}/transparencia/posts/${post.id}`,
      siteName: "Clube Atlético Tubarão SAF",
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

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
    <div className="min-h-screen bg-background pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.body.replace(/<\/?[^>]+(>|$)/g, "").replace(/[#*`~_\[\]()]/g, "").trim().substring(0, 160),
            datePublished: new Date(post.publishedAt).toISOString(),
            dateModified: new Date(post.updatedAt || post.publishedAt).toISOString(),
            author: {
              "@type": "Organization",
              name: "Associação Desportiva Tubarão",
            },
            publisher: {
              "@type": "Organization",
              name: "Associação Desportiva Tubarão",
            },
          }),
        }}
      />
      <div className="bg-muted/30 py-8 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/transparencia/posts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para documentos
          </Link>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">{categoryLabel}</Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{post.title}</h1>
              
              <ImmutabilityBadge publishedAt={post.publishedAt} />

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Publicado em {dateLabel}
                </span>
                {refLabel && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-foreground/80">Ref: {refLabel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {post.supersededById && (
          <Alert variant="warning" className="mb-6">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Atenção: Este documento foi substituído por uma versão mais recente</AlertTitle>
            <AlertDescription>
              Você está visualizando uma versão antiga.{" "}
              <Link href={`/transparencia/posts/${post.versionChain?.[post.versionChain.length - 1]?.id || post.supersededById}`} className="font-medium underline hover:text-amber-800 dark:hover:text-amber-200">
                Ver versão atual
              </Link>
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card shadow-sm border-border/50">
              <CardContent className="p-6 sm:p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-tables:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.body}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Anexos e Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.attachmentUrl ? (
                  <div className="space-y-2">
                    <Button asChild className="w-full justify-start" variant="default">
                      <a href={post.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Documento (PDF)
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Documentos em PDF podem não ser acessíveis a leitores de tela. Contate-nos para solicitar formato alternativo.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Este documento não possui anexos.</p>
                )}
              </CardContent>
            </Card>

            {post.versionChain && post.versionChain.length > 1 && (
              <Card className="bg-card shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Versões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l-2 border-muted ml-3 pl-4 space-y-4">
                    {post.versionChain.map((v, index) => {
                      const isCurrent = v.id === post.id;
                      const isOriginal = index === 0;
                      return (
                        <div key={v.id} className="relative">
                          <div className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-4 ring-background ${isCurrent ? 'bg-primary' : 'bg-muted-foreground'}`} />
                          {isCurrent ? (
                            <div className="font-medium text-sm text-foreground">
                              Versão {v.version} (atual)
                            </div>
                          ) : (
                            <Link href={`/transparencia/posts/${v.id}`} className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
                              Versão {v.version} {isOriginal && "(original)"}
                            </Link>
                          )}
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(v.publishedAt))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {post.isArchived && (
              <Card className="bg-destructive/10 border-destructive/20 text-destructive shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                  <History className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Documento Arquivado</p>
                    <p className="text-destructive/80">Este documento foi arquivado e pode conter informações desatualizadas ou que foram substituídas por uma versão mais recente.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
