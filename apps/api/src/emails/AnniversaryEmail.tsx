import { Heading, Text, Section, Button } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface AnniversaryEmailProps {
  name: string;
  yearsSince: number;
}

export const AnniversaryEmail = ({ name, yearsSince }: AnniversaryEmailProps) => {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;
  
  const yearsText = yearsSince > 1 ? `${yearsSince} anos` : "1 ano";

  return (
    <EmailLayout previewText={`${yearsText} juntos, ${name}! 🦈`}>
      <Heading className="text-2xl font-bold text-gray-800 my-0">{yearsText} juntos, {name}! 🦈</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        {yearsText} de reconstrução. Você é parte da história do Tubarão.
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
