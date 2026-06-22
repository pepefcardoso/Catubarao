import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface DelinquencyD7EmailProps {
  name: string;
}

export const DelinquencyD7Email = ({ name }: DelinquencyD7EmailProps) => {
  return (
    <EmailLayout previewText="Aviso sobre seu pagamento">
      <Heading className="text-xl font-bold text-gray-800 my-0">Olá, {name}!</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        Ainda não conseguimos identificar o pagamento da sua assinatura.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Lembramos que, se o pagamento não for regularizado, sua assinatura e seus benefícios podem ser suspensos em breve.
      </Text>
    </EmailLayout>
  );
};

export default DelinquencyD7Email;
