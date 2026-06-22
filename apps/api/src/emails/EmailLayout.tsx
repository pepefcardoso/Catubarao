import { Body, Container, Head, Html, Img, Preview, Section, Text, Tailwind } from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ previewText, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-gray-800 m-0 p-0">
          <Container className="mx-auto my-0 p-4 w-full max-w-[375px] sm:max-w-[600px]">
            <Section className="text-center pb-4">
              <Img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Clube_Atl%C3%A9tico_Tubar%C3%A3o_2020.png"
                width="64"
                height="64"
                alt="Clube Atlético Tubarão"
                className="mx-auto"
              />
            </Section>

            {children}

            <Section className="text-center mt-8 pt-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 mb-2 mt-0">
                Você está recebendo este e-mail pois é sócio-torcedor do Clube Atlético Tubarão.
              </Text>
              <Text className="text-xs text-gray-500 mt-0">
                Para parar de receber estes e-mails, você pode{" "}
                <a href="#" className="text-blue-600 underline">
                  cancelar sua inscrição aqui
                </a>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
