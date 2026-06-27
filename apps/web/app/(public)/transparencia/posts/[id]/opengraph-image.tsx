import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { apiFetch } from "@/lib/api";
import { TransparencyPostResponse } from "@repo/schemas/transparency";

export const runtime = "edge";
export const alt = "Portal de Transparência - Clube Atlético Tubarão";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const CATEGORY_LABELS: Record<string, string> = {
  BALANCO_MENSAL: "Balanço Mensal",
  STATUS_DIVIDAS: "Status de Dívidas",
  ATA_ASSEMBLEIA: "Ata de Assembleia",
  COMPOSICAO_SOCIETARIA: "Composição Societária",
  DOCUMENTO_SAF: "Documento SAF",
  OUTRO: "Outros",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const post = await apiFetch<TransparencyPostResponse>(
      `${env.NEXT_PUBLIC_API_URL}/transparency/posts/${id}`,
      { next: { revalidate: 3600 } }
    );

    if (!post) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: "white",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Documento não encontrado
          </div>
        ),
        { ...size }
      );
    }

    const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
    const dateLabel = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(post.publishedAt));

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #09090b, #18181b)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '80px',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#27272a',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignSelf: 'flex-start',
              }}
            >
              {categoryLabel}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.1,
                marginTop: '40px',
                display: 'flex',
                maxWidth: '900px',
              }}
            >
              {post.title}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 32, color: '#e4e4e7' }}>Publicado em {dateLabel}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 40, fontWeight: 'bold' }}>Clube Atlético Tubarão</div>
              <div style={{ fontSize: 24, color: '#a1a1aa', marginTop: '8px' }}>Portal de Transparência</div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Erro ao carregar documento
        </div>
      ),
      { ...size }
    );
  }
}
