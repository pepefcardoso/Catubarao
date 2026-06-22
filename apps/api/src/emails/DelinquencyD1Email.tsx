import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface DelinquencyD1EmailProps {
  name: string;
}

export const DelinquencyD1Email = ({ name }: DelinquencyD1EmailProps) => {
  return (
    <EmailLayout previewText="Aviso sobre seu pagamento">
      <Heading className="text-xl font-bold text-gray-800 my-0">Olá, {name}!</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        Não conseguimos identificar o pagamento da sua assinatura do Clube Atlético Tubarão.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Por favor, verifique se houve algum problema com seu cartão de crédito ou se você esqueceu de realizar o pagamento.
      </Text>
    </EmailLayout>
  );
};

export default DelinquencyD1Email;
