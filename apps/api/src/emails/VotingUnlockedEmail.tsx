import { Heading, Text, Section, Button } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface VotingUnlockedEmailProps {
  name: string;
}

export const VotingUnlockedEmail = ({ name }: VotingUnlockedEmailProps) => {
  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/transparency`;

  return (
    <EmailLayout previewText={`🗳️ Seu voto agora conta, ${name}`}>
      <Heading className="text-xl font-bold text-gray-800 my-0">🗳️ Seu voto agora conta, {name}</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        12 meses de contribuição ininterrupta. A democracia do Tubarão te espera.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Você atingiu a marca de 12 meses de adimplência contínua. Agora você tem direito a voto nas decisões do clube através do nosso Portal de Transparência.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={portalLink}
        >
          Acessar Portal
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default VotingUnlockedEmail;
