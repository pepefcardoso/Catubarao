import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Clube Atlético Tubarão",
  description: "Política de Privacidade do Clube Atlético Tubarão",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground mb-8">
          Esta é uma página de placeholder. O conteúdo oficial da Política de Privacidade será fornecido pelo departamento jurídico do clube.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Coleta de Dados</h2>
          <p>
            Informações sobre como coletamos seus dados pessoais e cookies serão descritas aqui.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Uso de Dados</h2>
          <p>
            Detalhes sobre como utilizamos as informações coletadas para melhorar nossos serviços.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. LGPD e Seus Direitos</h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), detalharemos seus direitos quanto aos seus dados pessoais e como exercê-los.
          </p>
        </section>
      </div>
    </div>
  );
}
