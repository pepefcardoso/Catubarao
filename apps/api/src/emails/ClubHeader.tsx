import { Img, Section, Text } from "@react-email/components";
import * as React from "react";

export const ClubHeader = () => {
  return (
    <Section className="bg-black text-center py-6 px-4">
      <Img
        src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Clube_Atl%C3%A9tico_Tubar%C3%A3o_2020.png"
        width="64"
        height="64"
        alt="Clube Atlético Tubarão"
        className="mx-auto"
      />
      <Text className="text-white text-xl font-bold uppercase tracking-widest mt-4 mb-0 font-sans">
        Clube Atlético Tubarão
      </Text>
    </Section>
  );
};

export default ClubHeader;
