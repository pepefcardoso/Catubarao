import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface PaymentConfirmedEmailProps {
  name: string;
  planName: string;
}

export const PaymentConfirmedEmail = ({ name, planName }: PaymentConfirmedEmailProps) => {
  return (
    <EmailLayout previewText="Seu pagamento foi confirmado">
      <Heading className="text-xl font-bold text-gray-800 my-0">Olá, {name}!</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        Passando para avisar que o pagamento da sua assinatura do plano <strong>{planName}</strong> foi confirmado com sucesso.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Sua carteirinha digital continua ativa e você já pode aproveitar todos os benefícios do seu plano.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-semibold">
        Obrigado por apoiar o Clube Atlético Tubarão!
      </Text>
    </EmailLayout>
  );
};

export default PaymentConfirmedEmail;
