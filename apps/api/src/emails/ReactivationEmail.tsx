import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface ReactivationEmailProps {
  name: string;
  planName: string;
}

export const ReactivationEmail = ({ name, planName }: ReactivationEmailProps) => {
  return (
    <EmailLayout previewText={`Que bom ter você de volta! 🎉`}>
      <Heading className="text-xl font-bold text-gray-800 my-0">Que bom ter você de volta! 🎉</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        O Tubarão é mais forte com você. Sua carteirinha está ativa novamente.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Seu pagamento foi confirmado e sua assinatura do plano <strong>{planName}</strong> foi reativada com sucesso. Obrigado por continuar apoiando o Clube Atlético Tubarão!
      </Text>
    </EmailLayout>
  );
};

export default ReactivationEmail;
