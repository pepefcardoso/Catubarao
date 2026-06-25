import { Section, Text, Link } from "@react-email/components";
import * as React from "react";

export const EmailFooter = () => {
  return (
    <Section className="text-center mt-8 pt-6 pb-6 border-t border-gray-200">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Siga o Tubarão
      </Text>
      <Text className="text-sm text-gray-500 mb-4">
        <Link href="#" className="text-blue-600 underline mr-4">WhatsApp</Link>
        <Link href="#" className="text-blue-600 underline">Instagram</Link>
      </Text>

      <Text className="text-xs text-gray-500 mb-2 mt-4">
        Dúvidas? Entre em contato: <Link href="mailto:contato@catubarao.com.br" className="text-blue-600 underline">contato@catubarao.com.br</Link>
      </Text>

      <Text className="text-xs text-gray-500 mb-2 mt-4">
        Este e-mail foi enviado porque você é sócio-torcedor do Clube Atlético Tubarão.
        Nós respeitamos a sua privacidade e os seus dados são tratados de acordo com a LGPD (Lei Geral de Proteção de Dados).
      </Text>
      <Text className="text-xs text-gray-500 mt-0">
        Para não receber mais estas comunicações, você pode{" "}
        <Link href="{{unsubscribe_url}}" className="text-blue-600 underline">
          cancelar sua inscrição aqui
        </Link>.
      </Text>
    </Section>
  );
};

export default EmailFooter;
