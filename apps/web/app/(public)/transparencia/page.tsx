import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { env } from "@/lib/env";
import { apiFetch } from "@/lib/api";
import { DebtRecordResponse, TransparencyPostResponse } from "@repo/schemas/transparency";
import { FileText, ArrowRight, TrendingDown, DollarSign, Handshake } from "lucide-react";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Portal de Transparência | Clube Atlético Tubarão",
    description: "Acompanhe de perto a reestruturação e as contas do Clube Atlético Tubarão.",
  };
}

export const revalidate = 300; // 5 minutes
async function getDebts() {
  try {
    const res = await apiFetch<Record<string, DebtRecordResponse[]>>(`${env.NEXT_PUBLIC_API_URL}/transparency/debts`);
    return res;
  } catch (error) {
    console.error("Failed to fetch debts", error);
    return {};
  }
}

async function getLatestPosts(category: string) {
  try {
    const res = await apiFetch<{ posts: TransparencyPostResponse[] }>(`${env.NEXT_PUBLIC_API_URL}/transparency/posts?category=${category}&limit=3`);
    return res.posts;
  } catch (error) {
    console.error(`Failed to fetch posts for ${category}`, error);
    return [];
  }
}

export default async function TransparenciaPage() {
  const [debts, balancos, atas] = await Promise.all([
    getDebts(),
    getLatestPosts("BALANCO_MENSAL"),
    getLatestPosts("ATA_ASSEMBLEIA"),
  ]);

  let totalOriginal = 0;
  let totalRemaining = 0;
  let renegotiatedCount = 0;

  Object.values(debts).flat().forEach((debt) => {
    totalOriginal += debt.originalAmount;
    
    const negotiated = debt.negotiatedAmount ?? debt.originalAmount;
    totalRemaining += Math.max(0, negotiated - debt.paidAmount);
    
    if (debt.negotiatedAmount != null) {
      renegotiatedCount++;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-24 px-4 sm:px-6 lg:px-8 border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Contas claras, futuro sólido
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Acompanhe de perto a reestruturação do Clube Atlético Tubarão. Nosso compromisso é com a transparência absoluta e responsabilidade com cada centavo, garantindo um futuro próspero para o nosso clube.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20 max-w-7xl">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <TrendingDown className="size-5 text-destructive" />
                </div>
                <CardTitle className="text-lg">Dívida Original Total</CardTitle>
              </div>
              <CardDescription>Valor histórico das obrigações</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-foreground">{formatCurrency(totalOriginal)}</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Dívida Restante</CardTitle>
              </div>
              <CardDescription>Valor atual após abatimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-primary">{formatCurrency(totalRemaining)}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Handshake className="size-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">Credores Renegociados</CardTitle>
              </div>
              <CardDescription>Acordos de renegociação firmados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-foreground">{renegotiatedCount}</p>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Latest Balanços */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-semibold tracking-tight">Últimos Balanços</h2>
            </div>
            <div className="space-y-4">
              {balancos.map((post) => (
                <Link href={`/transparencia/${post.id}`} key={post.id} className="block group">
                  <Card className="group-hover:border-primary/50 transition-colors bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <FileText className="size-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription>{formatDate(post.publishedAt)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {balancos.length === 0 && (
                <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  Nenhum balanço publicado recentemente.
                </div>
              )}
            </div>
          </section>

          {/* Latest Atas */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-semibold tracking-tight">Atas de Assembleia</h2>
            </div>
            <div className="space-y-4">
              {atas.map((post) => (
                <Link href={`/transparencia/${post.id}`} key={post.id} className="block group">
                  <Card className="group-hover:border-primary/50 transition-colors bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <FileText className="size-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription>{formatDate(post.publishedAt)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {atas.length === 0 && (
                <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  Nenhuma ata publicada recentemente.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="flex justify-center pt-8">
          <Button asChild size="lg" className="rounded-full px-8 h-14 text-base shadow-lg hover:shadow-xl transition-all">
            <Link href="/transparencia/documentos">
              Ver todos os documentos <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
