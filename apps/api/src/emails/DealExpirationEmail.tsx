import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface DeliverablePreview {
  id: string;
  description: string;
  frequency: string;
}

export interface DealExpirationEmailProps {
  partnerName: string;
  dealId: string;
  endDate: string;
  daysRemaining: number;
  deliverables: DeliverablePreview[];
}

export const DealExpirationEmail = ({
  partnerName,
  dealId,
  endDate,
  daysRemaining,
  deliverables,
}: DealExpirationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Aviso: Contrato com {partnerName} expira em {daysRemaining} dias</Preview>
      <Body style={main}>
        <EmailLayout>
          <Container style={container}>
            <Heading style={h1}>Renovação de Contrato</Heading>
            <Text style={text}>
              O contrato de patrocínio com a empresa <strong>{partnerName}</strong> expira em {daysRemaining} dias (em {new Date(endDate).toLocaleDateString('pt-BR')}).
            </Text>
            
            {deliverables && deliverables.length > 0 && (
              <Section style={section}>
                <Text style={subTitle}>Entregas do Contrato:</Text>
                <ul style={list}>
                  {deliverables.map((d) => (
                    <li key={d.id} style={listItem}>
                      {d.description} ({d.frequency})
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Text style={text}>
              Por favor, entre em contato com o parceiro para iniciar as tratativas de renovação.
            </Text>
            
            <Section style={buttonContainer}>
              <Link
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/partners/deals/${dealId}`}
              >
                Acessar Contrato
              </Link>
            </Section>
          </Container>
        </EmailLayout>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 48px",
  margin: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 48px",
};

const subTitle = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
};

const section = {
  padding: "0 48px",
  margin: "24px 0",
};

const list = {
  margin: "0",
  padding: "0 0 0 24px",
};

const listItem = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};

const buttonContainer = {
  padding: "0 48px",
  margin: "32px 0 0",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "10px",
};

export default DealExpirationEmail;
