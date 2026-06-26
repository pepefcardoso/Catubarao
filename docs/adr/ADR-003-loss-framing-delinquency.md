# ADR 003: Loss Framing in Delinquency Flows

## Status

Accepted

## Context

When a member's payment fails or they become delinquent, we must communicate with them to recover the payment. The framing of this message significantly impacts conversion. Traditional payment reminders ("Please update your card to continue your benefits") are often ignored.

## Decision

We will use **loss framing** in all delinquency flows and communications (e.g., `"Você perdeu: Carteirinha de Sócio..."`, `"Seus benefícios foram suspensos"`).

This approach is rooted in **Daniel Kahneman's principle of loss aversion**, which demonstrates that the psychological pain of losing something is approximately twice as powerful as the pleasure of gaining the equivalent thing. By framing the delinquency as the immediate loss of acquired status and benefits, we create a stronger psychological urgency to resolve the issue.

## Consequences

- **Positive:** Higher payment recovery rates and faster resolution of delinquency.
- **Positive:** Reinforces the perceived value of the membership benefits (since losing them is framed as a significant event).
- **Negative:** The tone may feel slightly aggressive or negative to some users, requiring careful copywriting to balance urgency with empathy (e.g., "it's easy to get them back").
