# ADR 002: Annual Plan Pricing Display

## Status

Accepted

## Context

When displaying the pricing for the annual membership plan (Sócio-Torcedor), we need to decide how to present the cost to the user. Presenting a large lump sum (e.g., R$ 360/year) can cause sticker shock and reduce conversion rates compared to the monthly plan (e.g., R$ 35/month). We need a display strategy that maximizes the perceived value of the annual commitment.

## Decision

We will display the annual plan's pricing as its **monthly-equivalent price** (e.g., "R$ 30/mês", billed annually at R$ 360) rather than strictly as a yearly total. 

This decision leverages the **anchoring effect** and draws upon **Dan Ariely's decoy effect** research. By anchoring the user to the monthly equivalent ("R$ 30/mês") and placing it next to the standard monthly plan ("R$ 35/mês"), the annual plan is perceived as a discount and a better deal, rather than a large upfront expense.

## Consequences

- **Positive:** Increases the conversion rate for annual plans, improving upfront cash flow and reducing churn.
- **Positive:** Reduces cognitive load for users comparing the cost-benefit of monthly vs. annual.
- **Negative:** Requires clear UI copy (e.g., "cobrado anualmente") to avoid misleading users about the billing frequency, ensuring legal and ethical compliance.
