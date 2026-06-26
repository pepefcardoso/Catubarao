# Platform KPIs & Conversion Metrics

This document defines what success looks like for the platform, establishing quantifiable targets for each phase (specifically Phase 3: Polish & Growth).

## KPI Definitions

| KPI | Target | Formula | Data Source | Measurement Cadence | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Signup conversion rate** | 15–20% | (Completed Payments / Unique Visitors to Signup Page) * 100 | Web analytics funnel (e.g., PostHog/Mixpanel) + `Payment` table | Weekly | ADMIN (Growth/Marketing) |
| **Monthly churn rate** | < 5% | (Members Suspended at D+30 / Total Active Members at Start of Month) * 100 | `Subscription` table (status tracking) | Monthly | ADMIN (Customer Success) |
| **Referral rate** | > 25% | (New Members with `referredById` / Total New Members) * 100 | `Member` table | Monthly | ADMIN (Marketing) |
| **Transparency portal engagement** | Baseline TBD | Unique monthly visitors to `/transparency` | Web analytics (e.g., Google Analytics / PostHog) | Monthly | ADMIN (Communications) |
| **Reactivation rate** | > 40% | (Suspended Subscriptions Reactivated within 30d / Total Suspended Subscriptions) * 100 | `Subscription` and `AuditLog` tables | Monthly | ADMIN (Customer Success) |
| **Check-in rate** | > 50% of local members | (Unique `GamificationEvent` of type MATCH_CHECK_IN / Total Active Local Members) * 100 | `MatchEvent` and `GamificationEvent` tables | Per match / Weekly | ADMIN (Operations) |
| **Annual plan adoption rate**| > 60% of paid plans | (Active Annual Subscriptions / Total Active Paid Subscriptions) * 100 | `Subscription` table joined with `MembershipPlan` | Monthly | ADMIN (Finance) |
| **WhatsApp opt-in rate** | > 70% of members | (Members with `whatsappOptIn` = true / Total Active Members) * 100 | `Member` table | Monthly | ADMIN (Communications) |

## § Anti-Metrics

These are metrics the team should **NOT** optimize for. Tracking these as primary indicators of success can lead to behaviors that negatively impact core platform goals.

1. **Raw page views without conversion**
   - *Why to avoid:* Optimizing for traffic quality is better than traffic volume. Driving unqualified traffic inflates costs and distorts the conversion funnel.
   - *Focus instead on:* Meaningful engagement (e.g., transparency document downloads, full checkouts).

2. **Total registered free accounts**
   - *Why to avoid:* Free accounts that do not convert are a cost center, not a success metric. They provide a false sense of growth while adding load to support and infrastructure.
   - *Focus instead on:* Paid active subscriptions and actual revenue.

3. **Digital check-ins without physical attendance**
   - *Why to avoid:* Gamification mechanics can be easily gamed from home if not validated physically. Inflated digital check-ins fail to support matchday operations and capacity planning.
   - *Focus instead on:* Actual validated stadium attendance and physical presence at events.
