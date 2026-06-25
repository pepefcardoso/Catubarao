import { Heading, Text, Section, Button } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface ReferralSuccessEmailProps {
  ReferredName: string;
  N: number;
}

export const ReferralSuccessEmail = ({ ReferredName, N }: ReferralSuccessEmailProps) => {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/escudos`;

  return (
    <EmailLayout previewText={`${ReferredName} entrou por sua indicação!`}>
      <Heading className="text-xl font-bold text-gray-800 my-0">{ReferredName} entrou por sua indicação!</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-bold text-green-600">
        +{N} Escudos creditados. Obrigado por trazer mais um tijolo.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Sua indicação foi um sucesso. Cada novo sócio-torcedor é fundamental para a reconstrução do Clube Atlético Tubarão.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={dashboardLink}
        >
          Ver Meus Escudos
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ReferralSuccessEmail;
