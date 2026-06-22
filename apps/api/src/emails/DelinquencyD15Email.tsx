import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import * as React from "react";

interface DelinquencyD15EmailProps {
  name: string;
}

export const DelinquencyD15Email = ({ name }: DelinquencyD15EmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Último Aviso: Pagamento pendente - Clube Atlético Tubarão</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Olá, {name}!</Heading>
          <Text style={text}>
            Este é o nosso último aviso. O pagamento da sua assinatura está pendente há 15 dias.
            Se o pagamento não for realizado em breve, sua assinatura e os cartões de acesso serão suspensos em 15 dias.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DelinquencyD15Email;

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
