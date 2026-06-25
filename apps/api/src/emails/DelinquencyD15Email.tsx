import { Heading, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface DelinquencyD15EmailProps {
  name: string;
  whatsappSupportUrl?: string;
}

export const DelinquencyD15Email = ({ name, whatsappSupportUrl }: DelinquencyD15EmailProps) => {
  return (
    <EmailLayout previewText="Último aviso sobre seu pagamento">
      <Heading className="text-xl font-bold text-gray-800 my-0">Olá, {name}!</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        Este é o nosso último aviso. O pagamento da sua assinatura continua pendente.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed font-bold text-red-600">
        Sua assinatura e seus benefícios serão suspensos em breve se o pagamento não for regularizado.
      </Text>
      
      {whatsappSupportUrl && (
        <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
          Ou fale conosco pelo WhatsApp:{" "}
          <Link href={whatsappSupportUrl} className="text-blue-600 underline">clique aqui</Link>
        </Text>
      )}
    </EmailLayout>
  );
};

export default DelinquencyD15Email;
