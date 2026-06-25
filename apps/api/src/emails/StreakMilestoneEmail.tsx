import { Heading, Text, Section, Button } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";
import { env } from "../lib/env";

export interface StreakMilestoneEmailProps {
  name: string;
  streakMonths: number;
}

export const StreakMilestoneEmail = ({ name, streakMonths }: StreakMilestoneEmailProps) => {
  const dashboardLink = `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;

  let title = "Obrigado pela fidelidade!";
  let message = `Parabéns pelos seus ${streakMonths} meses de adimplência.`;

  if (streakMonths === 6) {
    title = "6 meses de fidelidade — obrigado, Tubarão!";
    message = "Você completou 6 meses seguidos como sócio-torcedor do Tubarão. Obrigado por apoiar o clube incondicionalmente!";
  } else if (streakMonths === 12) {
    title = "1 ano de fidelidade — você é um ídolo!";
    message = "Hoje você completa 1 ano de adimplência consecutiva. Sua dedicação faz o Tubarão mais forte a cada dia!";
  } else if (streakMonths === 24) {
    title = "2 anos de fidelidade — lenda do Tubarão!";
    message = "São 2 anos seguidos acreditando e apoiando o nosso projeto. Você é uma lenda na nossa arquibancada!";
  } else if (streakMonths === 36) {
    title = "3 anos de fidelidade — você é imortal!";
    message = "3 anos de amor incondicional ao Tubarão. Não temos palavras para agradecer tanto apoio!";
  } else if (streakMonths === 60) {
    title = "5 anos de fidelidade — monumento vivo!";
    message = "5 anos! Você já é parte fundamental da história do Tubarão. Muito obrigado por ser esse torcedor espetacular!";
  }

  return (
    <EmailLayout previewText={title}>
      <Heading className="text-2xl font-bold text-gray-800 my-0">Parabéns, {name}! 🦈</Heading>
      
      <Text className="text-sm text-gray-700 mt-4 leading-relaxed">
        {message}
      </Text>
      
      <Text className="text-sm text-gray-700 mt-2 leading-relaxed">
        Como forma de agradecimento, você acaba de receber pontos bônus no nosso programa de Escudos! 
        Acesse o seu painel de sócio para conferir.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-semibold"
          href={dashboardLink}
        >
          Acessar Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default StreakMilestoneEmail;
