import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import * as React from "react";

interface SuspensionEmailProps {
  name: string;
}

export const SuspensionEmail = ({ name }: SuspensionEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Assinatura Suspensa - Clube Atlético Tubarão</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Olá, {name}!</Heading>
          <Text style={text}>
            Informamos que a sua assinatura do Clube Atlético Tubarão foi suspensa devido à falta de pagamento por 30 dias.
            Seus benefícios e cartões de acesso estão temporariamente desativados.
            Para reativar sua assinatura e recuperar seus benefícios, por favor, realize o pagamento pendente.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SuspensionEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "17px 0 0",
  margin: "0",
};

const text = {
  color: "#333",
  fontSize: "14px",
  margin: "24px 0",
};
