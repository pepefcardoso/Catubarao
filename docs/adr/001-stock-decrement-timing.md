# ADR 001: Stock Decrement Timing

## Status

Accepted

## Context

The system supports `estoque_fixo` (fixed stock) products in the store module. A critical challenge is determining exactly when to decrement the stock count.

- se decrementarmos o estoque no momento da criação do pedido (checkout), usuários maliciosos podem reter estoque criando pedidos sem intenção de pagar, esgotando produtos para compradores legítimos.
- Se não fizermos nada até a confirmação do pagamento, múltiplos usuários podem comprar o último item simultaneamente, resultando em estoque negativo e falhas de entrega.

Precisamos de uma estratégia que evite estoque negativo e previna retenção maliciosa.

## Decision

We will decrement the actual `stockQuantity` **only upon successful payment confirmation** via the Mercado Pago webhook (`payment.approved`), synchronously and atomically using a database row lock (`SELECT ... FOR UPDATE`).

Durante a criação do pedido, NÃO reservamos ou decrementamos estoque. Apenas checamos se `stockQuantity > 0`. Se um checkout for abandonado, o pedido é cancelado, mas nenhum estoque precisa ser liberado.

Para prevenir a race condition onde dois usuários pagam pelo último item quase ao mesmo tempo, o processador do webhook:

1. Abre uma transação.
2. Faz o lock da linha da variante (`SELECT FOR UPDATE`).
3. Checa se `stockQuantity >= orderedQuantity`.
4. Se sim, decrementa o estoque e marca o pedido como `PAGO`.
5. Se não, o pagamento ocorreu, mas não há estoque. O sistema marcará o pedido para revisão manual do admin (que pode reembolsar manualmente via gateway). É um edge case aceitável para o volume inicial.

## Consequences

- **Positive:** Usuários não podem esgotar estoque sem pagar.
- **Positive:** Simplifica o fluxo de criação de pedido e evita jobs complexos de liberação de estoque.
- **Negative:** Pequeno risco de oversell (venda duplicada) do último item se dois clientes completarem o pagamento exato na mesma fração de segundo.

## Related Backlog Items

- STORE-005 (Order creation)
- STORE-006 (Order webhook handler)
