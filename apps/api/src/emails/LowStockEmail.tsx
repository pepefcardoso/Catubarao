import * as React from "react";
import { Html, Head, Body, Container, Text, Heading } from "@react-email/components";

export interface LowStockEmailProps {
  productName: string;
  productId: string;
  currentStock: number;
  threshold: number;
}

export const LowStockEmail: React.FC<LowStockEmailProps> = ({
  productName,
  productId,
  currentStock,
  threshold,
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <Container>
          <Heading>Alerta de Estoque Baixo</Heading>
          <Text>
            O produto <strong>{productName}</strong> atingiu o limite de alerta de estoque.
          </Text>
          <Text>Estoque atual: {currentStock} (Limite: {threshold})</Text>
          <Text>ID do Produto: {productId}</Text>
          <Text>Por favor, reabasteça o estoque ou ajuste a disponibilidade do produto.</Text>
        </Container>
      </Body>
    </Html>
  );
};
