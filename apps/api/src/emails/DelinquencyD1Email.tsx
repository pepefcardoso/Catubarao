import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface DelinquencyD1EmailProps {
  name: string;
}

export const DelinquencyD1Email = ({ name }: DelinquencyD1EmailProps) => {
  return (
    <EmailLayout previewText={`O Tubarão sente sua falta, ${name}`}>
      <Heading className="text-xl font-bold text-gray-800 my-0">O Tubarão sente sua falta, {name}</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-medium">
        Sua contribuição faz diferença. Regularize para continuar fazendo parte.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Não conseguimos identificar o pagamento da sua assinatura. Por favor, verifique se houve algum problema com seu cartão de crédito ou se você esqueceu de realizar o pagamento.
      </Text>
    </EmailLayout>
  );
};

export default DelinquencyD1Email;
