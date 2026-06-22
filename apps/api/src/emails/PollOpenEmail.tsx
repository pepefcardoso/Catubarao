import { Heading, Text, Button, Section } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

export interface PollOpenEmailProps {
  name: string;
  pollTitle: string;
  pollLink: string;
}

export const PollOpenEmail = ({ name, pollTitle, pollLink }: PollOpenEmailProps) => {
  return (
    <EmailLayout previewText="Nova votação aberta">
      <Heading className="text-xl font-bold text-gray-800 my-0">Olá, {name}!</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        Uma nova votação foi aberta no Portal de Transparência do Clube Atlético Tubarão e você é elegível para votar.
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        <strong>Votação:</strong> {pollTitle}
      </Text>

      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Sua voz é muito importante para nós. Acesse o portal e deixe seu voto.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={pollLink}
        >
          Acessar Votação
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default PollOpenEmail;
