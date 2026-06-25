import { Heading, Text, Button, Section } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface SuspensionEmailProps {
  name: string;
  reactivationLink: string;
}

export const SuspensionEmail = ({ name, reactivationLink }: SuspensionEmailProps) => {
  return (
    <EmailLayout previewText="Sua carteirinha foi desativada">
      <Heading className="text-xl font-bold text-gray-800 my-0">Sua carteirinha foi desativada</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        Clique abaixo para reativar e voltar à reconstrução.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Infelizmente, como não identificamos o pagamento da sua assinatura, ela foi suspensa. Você pode reativá-la a qualquer momento e voltar a aproveitar todos os benefícios de ser um sócio-torcedor.
      </Text>
      
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={reactivationLink}
        >
          Reativar Assinatura
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default SuspensionEmail;
