import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Página Pública | Portal de Transparência",
    description: "Área pública do Clube Atlético Tubarão SAF.",
  };
}

export default function PublicPage() {
  return <div>Public Area</div>;
}
