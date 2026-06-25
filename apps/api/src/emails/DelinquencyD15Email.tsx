import { Heading, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface DelinquencyD15EmailProps {
  name: string;
  suspensionDate: string;
  whatsappSupportUrl?: string;
}

export const DelinquencyD15Email = ({ name, suspensionDate, whatsappSupportUrl }: DelinquencyD15EmailProps) => {
  return (
    <EmailLayout previewText="Último aviso — sua carteirinha será desativada">
      <Heading className="text-xl font-bold text-gray-800 my-0">Último aviso — sua carteirinha será desativada</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed font-bold text-red-600">
        Em {suspensionDate}, sua carteirinha e acesso à loja serão suspensos.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        O pagamento da sua assinatura continua pendente. Regularize sua situação para não perder seus benefícios.
      </Text>
      
      {whatsappSupportUrl && (
        <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
          Dúvidas? Fale conosco pelo WhatsApp:{" "}
          <Link href={whatsappSupportUrl} className="text-blue-600 underline">clique aqui</Link>
        </Text>
      )}
    </EmailLayout>
  );
};

export default DelinquencyD15Email;
