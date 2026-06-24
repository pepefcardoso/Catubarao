import Link from "next/link";
import { z } from "zod";
import { TransparencyPostResponseSchema } from "@repo/schemas/transparency";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { ArrowRight, FileText } from "lucide-react";

type TransparencyPost = z.infer<typeof TransparencyPostResponseSchema>;

interface TransparencyTeaserSectionProps {
  latestPost: TransparencyPost | null;
}

export function TransparencyTeaserSection({ latestPost }: TransparencyTeaserSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container px-4 mx-auto flex flex-col lg:flex-row gap-12 items-center">
        
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <Badge variant="outline" className="text-brand-primary border-brand-primary/30 uppercase tracking-widest px-3 py-1 bg-brand-primary/5">
            Portal de Transparência
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Nossas contas, abertas para você.
          </h2>
          <p className="text-lg text-muted-foreground">
            Acreditamos que a confiança se constrói com a verdade. Todos os meses, publicamos nossos balanços, pagamentos e investimentos para que você saiba exatamente como o seu clube está sendo gerido.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/transparencia">Ver todas as contas abertas <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-[500px]">
          {latestPost ? (
            <Card className="shadow-xl border-t-4 border-t-brand-primary rotate-1 hover:rotate-0 transition-transform duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {latestPost.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(latestPost.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <CardTitle className="text-xl leading-tight line-clamp-2">
                  {latestPost.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {latestPost.body.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                </p>
              </CardContent>
              <CardFooter className="pt-0 border-t mt-4 flex items-center justify-between pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  {latestPost.attachmentUrl ? 1 : 0} anexo(s)
                </div>
                <Button asChild variant="ghost" size="sm" className="text-brand-primary hover:text-brand-primary/80">
                  <Link href={`/transparencia`}>Ler Documento</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
             <Card className="shadow-xl border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">Nenhum documento recente publicado.</p>
                </CardContent>
             </Card>
          )}
        </div>

      </div>
    </section>
  );
}
