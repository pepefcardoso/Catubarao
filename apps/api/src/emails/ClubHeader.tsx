import { Img, Section, Text } from "@react-email/components";
import * as React from "react";

export const ClubHeader = () => {
  return (
    <Section className="bg-black text-center py-6 px-4">
      <Img
        src={`${process.env.FRONTEND_URL || 'https://tubaraosaf.com.br'}/assets/logo.png`}
        width="64"
        height="64"
        alt="Clube Atlético Tubarão"
        className="mx-auto object-contain"
      />
      <Text className="text-white text-xl font-bold uppercase tracking-widest mt-4 mb-0 font-sans">
        Clube Atlético Tubarão
      </Text>
    </Section>
  );
};

export default ClubHeader;
