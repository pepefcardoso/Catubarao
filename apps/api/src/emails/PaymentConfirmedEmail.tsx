import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface PaymentConfirmedEmailProps {
  name: string;
  planName: string;
  amount: string;
}

export const PaymentConfirmedEmail = ({ name, planName, amount }: PaymentConfirmedEmailProps) => {
  return (
    <EmailLayout previewText="Mais um mês de reconstrução. Obrigado.">
      <Heading className="text-xl font-bold text-gray-800 my-0">Mais um mês de reconstrução. Obrigado.</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        Sua contribuição de R${amount} chegou. O Tubarão avança.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Sua carteirinha digital continua ativa no plano <strong>{planName}</strong> e você já pode aproveitar todos os benefícios.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-semibold">
        Obrigado por apoiar o Clube Atlético Tubarão!
      </Text>
    </EmailLayout>
  );
};

export default PaymentConfirmedEmail;
