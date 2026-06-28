import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import { TransparencyPostResponse } from "@repo/schemas/transparency";
import DocumentList from "./document-list";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Documentos e Balanços | Portal de Transparência | Atlético Tubarão",
    description: "Consulte os documentos públicos, atas e balanços do Clube Atlético Tubarão.",
  };
}
export default async function DocumentosPage() {
  // Fetch up to 1000 posts that have attachments
  const res = await apiFetch<{ posts: TransparencyPostResponse[] }>(
    `${env.NEXT_PUBLIC_API_URL}/transparency/posts?hasAttachment=true&limit=100`
  );

  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Repositório de Documentos</h1>
        <p className="text-muted-foreground mt-2">
          Consulte balanços, atas, e outros documentos públicos do clube.
        </p>
      </div>
      <DocumentList initialDocuments={res.posts} />
    </div>
  );
}
