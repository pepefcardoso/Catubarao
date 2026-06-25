import { Heading, Text, Button, Section } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface WelcomeEmailProps {
  name: string;
  planName: string;
  cardDownloadLink: string;
}

export const WelcomeEmail = ({ name, planName, cardDownloadLink }: WelcomeEmailProps) => {
  return (
    <EmailLayout previewText={`Bem-vindo à família, ${name}! 🦈`}>
      <Heading className="text-2xl font-bold text-gray-800 my-0">Bem-vindo à família, {name}! 🦈</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        A torcida ficou maior. Você agora é parte da reconstrução.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Seu pagamento foi confirmado com sucesso. Agora você faz parte do plano <strong>{planName}</strong>.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={cardDownloadLink}
        >
          Baixar Carteirinha Digital
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default WelcomeEmail;
