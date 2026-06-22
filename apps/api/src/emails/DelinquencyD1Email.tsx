import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import * as React from "react";

interface DelinquencyD1EmailProps {
  name: string;
}

export const DelinquencyD1Email = ({ name }: DelinquencyD1EmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Aviso: Pagamento pendente - Clube Atlético Tubarão</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Olá, {name}!</Heading>
          <Text style={text}>
            Notamos que o pagamento da sua assinatura do Clube Atlético Tubarão não foi confirmado.
            Por favor, regularize sua situação para continuar aproveitando os benefícios.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DelinquencyD1Email;

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
