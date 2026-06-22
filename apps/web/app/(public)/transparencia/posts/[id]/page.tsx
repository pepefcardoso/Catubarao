import { notFound } from "next/navigation";
import { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import { TransparencyPostResponse } from "@repo/schemas/transparency";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Download, FileText, ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600; // 1 hour

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

  const description = post.body.slice(0, 160) + (post.body.length > 160 ? "..." : "");

  return {
    title: `${post.title} | Portal de Transparência`,
    description,
    openGraph: {
      title: post.title,
      description,
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
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  <Button asChild className="w-full justify-start" variant="default">
                    <a href={post.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Documento (PDF)
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">Este documento não possui anexos.</p>
                )}
                
                {post.supersededById && (
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href={`/transparencia/posts/${post.supersededById}`}>
                      <History className="mr-2 h-4 w-4" />
                      Ver Versão Anterior
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
            
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
