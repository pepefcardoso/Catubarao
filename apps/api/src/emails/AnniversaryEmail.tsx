import { Heading, Text, Section, Button } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";
import { env } from "../lib/env";

export interface AnniversaryEmailProps {
  name: string;
  yearsSince: number;
}

export const AnniversaryEmail = ({ name, yearsSince }: AnniversaryEmailProps) => {
  const dashboardLink = `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;
  
  const yearsText = yearsSince > 1 ? `${yearsSince} anos` : "1 ano";

  return (
    <EmailLayout previewText={`Feliz aniversário de ${yearsText} como Sócio Tubarão!`}>
      <Heading className="text-2xl font-bold text-gray-800 my-0">Feliz Aniversário, {name}! 🎉</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        Hoje é um dia especial! Celebramos o seu aniversário de {yearsText} como Sócio-Torcedor do Clube Atlético Tubarão.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Para comemorar, creditamos pontos de aniversário no seu programa de Escudos.
        Obrigado por fazer parte da nossa família e nos ajudar a construir um clube cada vez mais forte!
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={dashboardLink}
        >
          Acessar Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default AnniversaryEmail;
