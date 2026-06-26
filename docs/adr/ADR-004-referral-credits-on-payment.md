# ADR 004: Referral Credits on Payment

## Status

Accepted

## Context

The platform includes a referral system where members earn points or credits for bringing in new members. A key mechanism to define is *when* these points are credited to the referrer: at the moment of the referred user's registration, or after their first successful payment.

## Decision

Referral points will be credited **only upon the referred user's first successful payment**, not upon initial registration.

### Trade-off Documented
While crediting points on registration would create a faster feedback loop and a more immediate dopamine hit (a faster referral flywheel), it opens the system to massive abuse. A malicious user could easily create fake accounts with dummy emails to farm referral points without generating any revenue for the club. The trade-off is accepting a slightly **slower referral flywheel** in exchange for **more reliable data and guaranteed revenue attribution**.

## Consequences

- **Positive:** Eliminates a major fraud vector (farming fake accounts for points).
- **Positive:** Ensures that rewards are only distributed when the club actually receives revenue, maintaining unit economics.
- **Negative:** The referrer experiences a delay in gratification, as they must wait for the new member to complete checkout before seeing their reward.
