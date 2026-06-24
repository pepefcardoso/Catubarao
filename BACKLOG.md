# REFACTOR-BACKLOG.md

Marketing, behavioral psychology, and conversion optimization improvements derived from the Strategic Analysis (June 24, 2026). Each task is sized for a single AI agent session (~2–4h of implementation).

**Source of truth:** `strategic_analysis.md` for requirements, `BACKLOG.md` for architecture conventions, `spec.md` for business rules, `AGENTS.md` for code conventions.  
**Rule:** a task is only "done" when every acceptance criterion is checked and `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass.

---

## Summary Table

| ID       | Title                                                     | Phase | Size | Depends on                                         |
| -------- | --------------------------------------------------------- | ----- | ---- | -------------------------------------------------- |
| UX-001   | Brand identity system — design tokens & club assets       | 0     | M    | FOUND-013                                          |
| UX-002   | Homepage — public front door                              | 0     | L    | UX-001, FOUND-016, MEMBER-015                      |
| UX-003   | Operation Rescue — narrative copy layer                   | 0     | S    | UX-001, UX-002                                     |
| DOC-001  | docs/ux-strategy.md — behavioral playbook                 | 0     | M    | —                                                  |
| UX-004   | Signup — step progress indicator                          | 1     | S    | MEMBER-016                                         |
| UX-005   | Plan selection — social proof & badges                    | 1     | M    | MEMBER-017, UX-001                                 |
| UX-006   | Post-signup — welcome celebration page                    | 1     | M    | MEMBER-018, MEMBER-019, UX-001                     |
| UX-007   | Referral — visibility & sharing UI                        | 1     | M    | MEMBER-013, MEMBER-019                             |
| UX-008   | Membership checkout — trust signal sidebar                | 1     | S    | MEMBER-018, UX-001                                 |
| UX-009   | Transparency portal — visual authority overhaul           | 1     | L    | TRANS-008, TRANS-011, UX-001                       |
| UX-010   | Transparency — document immutability indicators           | 1     | S    | TRANS-010, TRANS-009                               |
| UX-011   | Store — members-only scarcity gate                        | 2     | S    | STORE-007, STORE-008                               |
| UX-012   | Store — stock scarcity indicators                         | 2     | S    | STORE-007, STORE-008, STORE-004                    |
| UX-013   | Dashboard — delinquency recovery UX                       | 2     | M    | MEMBER-019, MEMBER-009, UX-001                     |
| UX-014   | Dashboard — gamification redesign                         | 2     | L    | MEMBER-019, MEMBER-011                             |
| UX-015   | Public — collective impact visualization                  | 2     | M    | MEMBER-022, MEMBER-015, UX-001                     |
| UX-016   | Membership card — visual redesign                         | 2     | M    | MEMBER-020, UX-001                                 |
| UX-017   | Dashboard — voting rights celebration                     | 2     | S    | MEMBER-012, MEMBER-019                             |
| UX-018   | Homepage — recently joined social proof ticker            | 3     | S    | UX-002, MEMBER-015                                 |
| UX-019   | Signup/plans — exit-intent capture                        | 3     | S    | MEMBER-016, MEMBER-017                             |
| UX-020   | Dashboard — WhatsApp-first communication                  | 3     | M    | MEMBER-019, MEMBER-014                             |
| UX-021   | Plan selection — annual pricing nudge                     | 3     | S    | MEMBER-017                                         |
| UX-022   | Transparency — last updated indicator                     | 3     | S    | TRANS-008, UX-009                                  |
| UX-023   | Transparency — debt reduction celebration milestones      | 3     | S    | TRANS-011                                          |
| UX-024   | Accessibility — WCAG 2.1 AA hardening                     | 3     | L    | UX-002, UX-009, TRANS-008                          |
| UX-025   | Public — monument wall page                               | 3     | M    | MEMBER-019, UX-001                                 |
| UX-026   | Dashboard — match-day engagement loop                     | 3     | M    | MEMBER-028, MEMBER-011, MEMBER-019                 |
| UX-027   | Dashboard — anniversary & milestone celebrations          | 3     | S    | MEMBER-011, MEMBER-019                             |
| UX-028   | Profile — community identity markers                      | 3     | S    | MEMBER-019, UX-001                                 |
| UX-029   | Email — emotional template design                         | 3     | M    | MEMBER-014                                         |
| UX-030   | Transparency — creditor deep links                        | 3     | S    | TRANS-011                                          |
| UX-031   | Transparency — SEO & structured data                      | 3     | M    | TRANS-015, TRANS-008                               |
| UX-032   | Transparency — third-party validation badges              | 3     | S    | TRANS-008                                          |
| DOC-002  | spec.md — marketing-aware persona JTBD                    | 3     | S    | DOC-001                                            |
| DOC-003  | docs/narrative-touchpoints.md                             | 3     | S    | DOC-001                                            |
| DOC-004  | docs/INFO.md — expand into brand bible                    | 3     | M    | DOC-001                                            |
| DOC-005  | docs/acceptance/ — behavioral Gherkin scenarios           | 3     | M    | DOC-001                                            |
| DOC-006  | docs/kpis.md — conversion metrics                         | 3     | S    | DOC-001                                            |
| DOC-007  | docs/webhooks/ — Mercado Pago payload documentation       | 3     | S    | MEMBER-007                                         |
| DOC-008  | ADR-002 to ADR-005 — behavioral design decisions          | 3     | S    | —                                                  |
| DATA-001 | MembershipPlan — marketing schema fields                  | 4     | S    | MEMBER-001, MEMBER-002                             |
| DATA-002 | Product — SEO & feature schema fields                     | 4     | S    | STORE-001, STORE-002                               |
| DATA-003 | Member — memberNumber & leaderboard opt-in                | 4     | S    | MEMBER-001, MEMBER-002                             |
| DATA-004 | Schema naming unification & address normalization         | 4     | S    | MEMBER-001, MEMBER-002, STORE-002                  |
| DATA-005 | Testimonial model + admin CRUD                            | 4     | M    | FOUND-006, FOUND-008                               |
| DATA-006 | AnnouncementBanner model + frontend component             | 4     | M    | FOUND-006, FOUND-008, UX-001                       |

---

## Phase 0 — Marketing Foundation

---

### UX-001 — Brand identity system — design tokens & club assets

**Phase:** 0 · Marketing Foundation  
**Size:** M  
**Depends on:** FOUND-013

**Objective:** Replace the generic neutral shadcn palette with the club's visual identity — design tokens, crest component, and display typography — so every subsequent UX task builds on a consistent brand foundation.

> **Caution:** Do NOT hardcode hex values. Request official brand guidelines from the club before implementing. Use the tokens below as placeholders; rename with `TODO:` comments.

**In scope:**

- `apps/web/styles/globals.css` — add CSS custom properties alongside existing shadcn vars:
  ```css
  --brand-primary:    /* TODO: official green */;
  --brand-secondary:  /* TODO: official gold */;
  --brand-accent:     /* TODO: deep navy */;
  --brand-surface:    /* TODO: dark background */;
  --brand-gradient:   /* TODO: primary gradient */;
  ```
- `packages/config/design/tokens.ts` — TypeScript object re-exporting the same tokens for use in `tailwind.config.ts` (extends `theme.colors`)
- `packages/ui/src/components/ClubCrest.tsx` — SVG-based crest component accepting `size` and `className` props; renders a placeholder SVG until the official asset is provided
- `apps/web/app/layout.tsx` — add display font (e.g., `next/font/google` with Bebas Neue or Oswald) alongside existing Inter; expose as `--font-display` CSS variable
- Extend Tailwind config in `apps/web` to include `font-display` utility class and `brand-*` color utilities
- `packages/ui/src/components/ClubCrest.tsx` exported from `@repo/ui`

**Out of scope:** Any page-level color application — UX-003 and later tasks handle copy-on changes to specific pages.

**Acceptance criteria:**

- [x] `<ClubCrest size={48} />` renders without error in a test page
- [x] `bg-brand-primary` and `text-brand-secondary` utility classes resolve correctly in Tailwind
- [x] `var(--font-display)` is accessible in any CSS module or inline style
- [x] `pnpm --filter web build` passes with no new TypeScript errors
- [x] All token values are marked with `/* TODO: replace with official brand value */` comments

---

### UX-002 — Homepage — public front door

**Phase:** 0 · Marketing Foundation  
**Size:** L  
**Depends on:** UX-001, FOUND-016, MEMBER-015

**Objective:** Replace `apps/web/app/(public)/page.tsx` (currently `<div>Public Area</div>`) with a full conversion-optimized homepage — the single highest-impact missing piece in the entire platform.

**In scope:**

- Route: `/(public)/page.tsx` — SSR with ISR revalidation of 60 seconds
- **Section 1 — Hero:** full-viewport hero with stadium/crowd background image (`next/image` with `priority` and `fill`), headline `"O Tubarão é nosso. A reconstrução é agora."`, subheading, and primary CTA `"Seja Sócio"` → `/signup`; secondary CTA `"Ver as contas"` → `/transparencia`
- **Section 2 — Live counter:** embeds `MemberCounterWidget` (client component, hydrates post-SSR); displays `"X tubarões já entraram. Falta você."`; polls `GET /stats/members` every 30s; initial value SSR'd via `generateStaticParams`
- **Section 3 — Benefit strip:** 3 cards: `Carteirinha Digital`, `Voto em Assembleias`, `Muro dos Fundadores` — each with icon, headline, and one-sentence description
- **Section 4 — Goal progress:** renders admin-configured goals from `GET /stats/members`; each goal shows a progress bar and an impact phrase (e.g., `"Com 500 sócios, pagamos salários do sub-17"`); uses `--brand-primary` for progress fill
- **Section 5 — Transparency teaser:** fetches the most recent `TransparencyPost`; shows title, category badge, date, and excerpt; CTA `"Ver todas as contas abertas →"` → `/transparencia`
- **Section 6 — Store teaser:** fetches `GET /store/products?isFeatured=true&limit=3`; renders 3 product cards with `"Exclusivo para Sócios"` badge when applicable; CTA `"Ver loja →"` → `/loja`
- **Section 7 — Full-width CTA footer:** `"Faça parte da reconstrução"` headline, member count as social proof, `"Assinar agora"` button
- `apps/web/components/home/` folder — one component file per section, co-located with the page
- LCP target: hero image must load in < 2s; verified via `pnpm --filter web build && next/bundle-analyzer`

**Out of scope:** Backend changes — all data is fetched from existing endpoints.

**Acceptance criteria:**

- [x] `/(public)` renders all 7 sections without errors (verified via `pnpm --filter web dev`)
- [x] Live counter hydrates client-side without layout shift (CLS < 0.1)
- [x] Page is accessible without authentication
- [x] Goal progress bars reflect data from `GET /stats/members`
- [x] Store teaser shows only `isFeatured` products (requires DATA-002)
- [x] ISR revalidation set to 60s (`export const revalidate = 60`)
- [x] `pnpm --filter web build` passes with no TypeScript errors

---

### UX-003 — Operation Rescue — narrative copy layer

**Phase:** 0 · Marketing Foundation  
**Size:** S  
**Depends on:** UX-001, UX-002

**Objective:** Weave the "Operation Rescue" narrative copy into every key touchpoint — no new components, only targeted copy updates across existing pages.

**In scope:**

Copy replacements per page (exact placements are in `strategic_analysis.md §3.2`):

| File | Location | Replace with |
|------|----------|--------------|
| `apps/web/app/(public)/signup/page.tsx` | Step 1 subtitle | `"Você está a 2 minutos de fazer parte da história."` |
| `apps/web/app/(member)/plans/page.tsx` | Page subtitle | `"Cada plano é um tijolo na reconstrução. Escolha o seu."` |
| `apps/web/app/(member)/dashboard/page.tsx` | Welcome heading | `"Sua contribuição este mês: R${amount}. Juntos já contribuímos R${total}."` |
| `apps/web/app/(public)/transparencia/page.tsx` | Hero subheading | `"Sem segredos. Sem desculpas. Os números estão aqui."` |
| `apps/web/app/(member)/dashboard/page.tsx` | Delinquency banner (suspended) | `"O Tubarão sente sua falta. Volte para a reconstrução."` |

- All copy must use the member's `name` from `useSession()` where the template calls for `{name}`
- `apps/web/lib/copy.ts` — centralized copy constants file; export all narrative strings so they can be updated without hunting through JSX
- No hardcoded copy in JSX — import from `@/lib/copy`

**Out of scope:** Email copy (UX-029), new page components, backend changes.

**Acceptance criteria:**

- [x] All 5 copy replacements are live and rendered correctly
- [x] `{name}` and `{amount}` templates resolve to real data (not empty strings)
- [x] All copy strings are importable from `@/lib/copy`
- [x] `pnpm --filter web typecheck` passes

---

### DOC-001 — docs/ux-strategy.md — behavioral playbook

**Phase:** 0 · Marketing Foundation  
**Size:** M  
**Depends on:** —

**Objective:** Create the missing behavioral design playbook so future developers understand *why* UX decisions follow persuasion psychology principles — preventing regression to generic, emotionally inert implementations.

**In scope:**

- `docs/ux-strategy.md` with the following sections:
  1. **Target Emotions per Page** — table mapping each route to the intended emotional state (e.g., homepage → belonging + urgency, dashboard → pride + achievement)
  2. **Conversion Funnel Map** — diagram (Mermaid) of the full member funnel: Homepage → Signup → Plan Selection → Checkout → Dashboard; expected drop-off points and mitigation strategy for each
  3. **Behavioral Levers in Use** — section per Cialdini principle (Social proof, Scarcity, Reciprocity, Commitment, Authority, Liking, Unity) with specific UI locations where each is applied
  4. **Copy Guidelines** — tone of voice definition (`"formal na transparência, apaixonado na torcida"`), forbidden phrases (`"em breve"`, `"se Deus quiser"`), required narrative anchors (`"sem segredos"`, `"a reconstrução é nossa"`)
  5. **A/B Testing Plan** — first 5 elements to test with hypothesis, metric, and minimum detectable effect
  6. **Do Not Regress** — checklist of emotional design decisions that must not be removed without updating this document

**Acceptance criteria:**

- [ ] Document is created at `docs/ux-strategy.md`
- [ ] Mermaid funnel diagram renders correctly in GitHub markdown
- [ ] All 7 Cialdini principles are mapped to at least one specific UI component or page
- [ ] Copy guidelines section explicitly lists at least 5 forbidden phrases and 5 required anchors
- [ ] Referenced by `AGENTS.md` in the documentation index (add one-line entry)

---

## Phase 1 — Conversion Optimization

---

### UX-004 — Signup — step progress indicator

**Phase:** 1 · Conversion Optimization  
**Size:** S  
**Depends on:** MEMBER-016

**Objective:** Add a visual step indicator to the 2-step signup form so users understand their progress — applying the goal gradient effect.

**In scope:**

- `packages/ui/src/components/StepIndicator.tsx` — new component; props: `current: number`, `total: number`, `labels: string[]`; renders a horizontal stepped indicator with filled/unfilled dots and label below each
- `apps/web/app/(public)/signup/page.tsx` — mount `<StepIndicator current={step} total={2} labels={["Seus Dados", "Escolha seu Plano"]} />` above the form
- Below the indicator: `"Leva menos de 2 minutos"` caption in `text-muted-foreground`
- Below the caption: reassurance bar `"🔒 Seus dados estão protegidos pela LGPD"` in a subtle `bg-muted` pill
- Export `StepIndicator` from `@repo/ui`

**Acceptance criteria:**

- [ ] Step 1 renders indicator with step 1 active, step 2 unfilled
- [ ] Step 2 renders indicator with both steps filled (or step 2 active depending on design)
- [ ] Indicator is visible on mobile (375px) without horizontal overflow
- [ ] `"Leva menos de 2 minutos"` and LGPD notice are present on both steps
- [ ] `pnpm --filter web typecheck` passes

---

### UX-005 — Plan selection — social proof & badges

**Phase:** 1 · Conversion Optimization  
**Size:** M  
**Depends on:** MEMBER-017, UX-001

**Objective:** Add social proof, pricing anchoring, and visual hierarchy to the plan selection page to maximize conversion at the highest-drop-off point in the funnel.

**In scope:**

- `GET /plans` response — extend each plan object with `subscriberCount` (add to the existing endpoint handler; query with `_count: { select: { subscriptions: { where: { status: "ACTIVE" } } } }`)
- `GET /plans` — add a `isMostPopular: boolean` flag on the plan with the highest `subscriberCount` (computed server-side, not stored)
- `apps/web/app/(member)/plans/page.tsx`:
  - **"Mais Popular" badge** on the plan where `isMostPopular === true`; rendered as a ribbon using `brand-primary` background
  - **"X sócios neste plano"** counter below each plan name
  - **Annual savings callout** when annual variant exists: `"Economize R${savings}/ano"` with crossed-out monthly-total price
  - **Recommended plan** visual treatment: slightly larger card using `ring-2 ring-brand-primary`, `"Recomendado"` ribbon top-right corner
  - **Sócio Solidário plan** (lowest tier): rendered last, smaller card, heart icon, copy `"Não pode pagar? Sem problema. Você ainda faz parte."`
- All badge components use tokens from UX-001

**Acceptance criteria:**

- [ ] Only one plan has the `"Mais Popular"` badge at a time
- [ ] `subscriberCount` is correct for each plan (verified against database)
- [ ] Annual savings callout only appears when an annual variant exists
- [ ] Sócio Solidário card is visually distinct and positioned last
- [ ] `pnpm --filter web typecheck` passes

---

### UX-006 — Post-signup — welcome celebration page

**Phase:** 1 · Conversion Optimization  
**Size:** M  
**Depends on:** MEMBER-018, MEMBER-019, UX-001

**Objective:** Create a `/welcome` interstitial page that fires immediately after first payment confirmation — the emotional peak of the signup journey — driving word-of-mouth and referral activation.

**In scope:**

- Route: `/(member)/welcome` — server component that reads `memberId` from session
- `GET /members/me` response must include `memberNumber` (requires DATA-003) and `referralCode`
- **Confetti animation**: `canvas-confetti` (3KB) triggered on page mount via `useEffect`; fires once, then cleans up
- **Welcome message**: `"Bem-vindo à família, {name}! Você é o sócio nº {memberNumber}."` using `--font-display` and `brand-primary` accent
- **Membership card preview**: static visual mock of the digital card (the real card requires QR; show a simplified version with name, tier, and club crest)
- **Share buttons section**: 
  - WhatsApp: `https://api.whatsapp.com/send?text={pre-filled message}` where message = `"Acabei de me tornar sócio do Tubarão! Entra comigo: {signup_url}?ref={referralCode}"`
  - Instagram: copy template button (Instagram stories deep link is not reliable — copy-to-clipboard instead)
- **Referral CTA**: `"Indique um amigo e ganhe {X} Escudos"` with the member's referral code visible and a copy button
- **Auto-redirect**: after 5 seconds of inactivity, show `"Ir para o Dashboard →"` button; do not auto-redirect — let the user choose
- Redirect from `MEMBER-018` checkout success: change `router.push("/socio")` to `router.push("/welcome")` only on first-time payment (check if `Payment` count === 1)

**Acceptance criteria:**

- [ ] Confetti fires once on page mount and does not repeat on re-render
- [ ] Member number is displayed correctly (not 0 or undefined)
- [ ] WhatsApp share URL pre-fills the correct referral link
- [ ] Referral code copy button copies to clipboard and shows `"Copiado!"` toast
- [ ] Returning to `/welcome` after the first visit still works (no 404)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-007 — Referral — visibility & sharing UI

**Phase:** 1 · Conversion Optimization  
**Size:** M  
**Depends on:** MEMBER-013, MEMBER-019

**Objective:** Surface the referral system on the member dashboard so it drives active sharing — currently the system is invisible despite the backend being complete.

**In scope:**

- `apps/web/app/(member)/dashboard/page.tsx` — add `ReferralCard` component in the quick-links section
- `apps/web/components/member/ReferralCard.tsx`:
  - Displays member's `referralCode` in a monospace font inside a bordered box
  - **Copy button**: copies code to clipboard, shows `"Copiado!"` feedback (2 seconds)
  - **WhatsApp share button** (primary): deep link with pre-filled message from `@/lib/copy` referral template
  - **Stats row**: `"Você indicou {count} amigos"` + `"+ {points} Escudos ganhos"` from `GET /members/me/referral`
  - Pre-filled share message: `"Fala, torcida! Eu já sou sócio do Tubarão. Usa meu código {CODE} e entra comigo: {url}?ref={CODE}"` — string from `copy.ts`
- `GET /members/me/referral` must return `{ code, successfulReferrals: number, pointsEarned: number }` — add `pointsEarned` field if not already present (sum `GamificationEvent` where `type = REFERRAL`)

**Acceptance criteria:**

- [ ] Referral card is visible on the dashboard without any additional navigation
- [ ] Copy button copies the raw code (not the full URL)
- [ ] WhatsApp share opens with pre-filled message on mobile
- [ ] Stats are accurate (verified against database)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-008 — Membership checkout — trust signal sidebar

**Phase:** 1 · Conversion Optimization  
**Size:** S  
**Depends on:** MEMBER-018, UX-001

**Objective:** Add a trust signal sidebar to the membership checkout page, matching the conversion best practices already applied to the store checkout.

**In scope:**

- `apps/web/app/(member)/checkout/page.tsx` — add a `CheckoutTrustSidebar` component rendered on the right side (desktop: `lg:col-span-1`; mobile: below the form)
- `apps/web/components/checkout/CheckoutTrustSidebar.tsx`:
  - 🔒 `"Pagamento 100% seguro via Mercado Pago"`
  - ↩️ `"Cancele a qualquer momento, sem multa"`
  - 📋 `"Seus dados são protegidos pela LGPD"`
  - 👥 `"Junte-se a +{count} sócios ativos"` — value from `GET /stats/members` (cached, no loading state needed)
  - Mercado Pago logo (`next/image`, SVG)
  - Subtle `border` and `rounded-lg` card container using existing shadcn tokens

**Acceptance criteria:**

- [ ] Sidebar is visible on the checkout page on desktop (>= lg breakpoint)
- [ ] Sidebar stacks below payment form on mobile (375px)
- [ ] Active member count is rendered (may be stale by up to 30s — acceptable)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-009 — Transparency portal — visual authority overhaul

**Phase:** 1 · Conversion Optimization  
**Size:** L  
**Depends on:** TRANS-008, TRANS-011, UX-001

**Objective:** Transform the transparency portal from a functional data dump into a trust engine — making the financial data emotionally compelling and credibility-building.

**In scope:**

**A. Debt Dashboard (`/(public)/transparencia/dividas`):**
- **Summary cards row** at top: 4 cards — Total Original, Total Pago, Total Restante, Número de Credores — with large bold numbers using `--font-display`, trend arrows (↓ in `text-green-500`, ↑ in `text-red-500`)
- **Animated circular progress chart**: `"X% da dívida já foi paga"` using a CSS-only circular progress ring (`stroke-dasharray` / `stroke-dashoffset`); animate on scroll-into-view via `IntersectionObserver`
- **Recharts area chart** for the timeline: gradient fill from `brand-primary` to transparent; x-axis = month labels, y-axis = total remaining; downward slope is the visual narrative
- **Per-creditor status badges**: `Quitado` (green), `Em Dia` (blue), `Em Negociação` (yellow), `Atrasado` (red) — consistent with existing `DebtStatus` enum
- **Public notes** displayed as a quote block below each creditor row when `publicNote` is set

**B. Publication Feed (`/(public)/transparencia/posts`):**
- **Reading time estimate**: computed from `body.split(" ").length / 200` words-per-minute; displayed as `"X min de leitura"` next to the date
- **Version badge**: `"Versão {N} — atualizado em {date}"` if post has prior versions (`supersededById` chain)
- **Category icons**: map `TransparencyCategory` enum to emoji icons (📊 balance, 💰 debt, 📋 assembly minutes, 🏛️ corporate structure) — rendered inline next to the category badge
- **Relative timestamps**: use `formatDistanceToNow` from `date-fns` for recency (`"há 3 dias"`)

**C. RSS Feed visibility:**
- Add `"📡 Assine o Feed RSS"` button in the transparency portal header linking to `/transparency/feed.xml`
- Include a `<link rel="alternate" type="application/rss+xml">` tag in the `<head>` via `generateMetadata()`

**Acceptance criteria:**

- [ ] Summary cards render correct values matching `GET /transparency/debts`
- [ ] Circular progress animation triggers on scroll, not on page load
- [ ] Area chart renders with at least 2 data points (graceful no-data state if fewer)
- [ ] Reading time estimate is present on every post card
- [ ] RSS link tag is in the page `<head>`
- [ ] Page scores 90+ on Lighthouse performance (run against staging)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-010 — Transparency — document immutability indicators

**Phase:** 1 · Conversion Optimization  
**Size:** S  
**Depends on:** TRANS-010, TRANS-009

**Objective:** Make the *mechanism* of document immutability visible to users — transforming a backend rule into a trust signal.

**In scope:**

- `apps/web/app/(public)/transparencia/posts/[id]/page.tsx`:
  - **"Registro imutável" badge**: rendered below the post title using a `Shield` icon (lucide-react) + `"Publicado em {date} às {time} — não pode ser alterado"`; wrap in a `<Tooltip>` (shadcn) explaining what immutability means: `"Este documento foi registrado e não pode ser modificado. Versões anteriores são preservadas e acessíveis."`
  - **Superseded warning**: if `supersededById` is set, render an amber `<Alert>` at the top: `"⚠️ Este documento foi substituído por uma versão mais recente"` with a link to the current version
  - **Version history sidebar** (collapsible `<Sheet>` or inline list): shows the chain of versions — `"Versão 1 (original) → Versão 2 → Versão 3 (atual)"` — by following `supersededById` backwards; each entry links to that version's URL
- `apps/web/components/transparency/ImmutabilityBadge.tsx` — extracted component, exported from the page

**Acceptance criteria:**

- [ ] Badge is present on every published post detail page
- [ ] Tooltip renders the full immutability explanation
- [ ] Superseded warning links to the correct successor post
- [ ] Version history shows the correct chain for a post with at least 2 versions
- [ ] `pnpm --filter web typecheck` passes

---

## Phase 2 — Engagement Layer

---

### UX-011 — Store — members-only scarcity gate

**Phase:** 2 · Engagement Layer  
**Size:** S  
**Depends on:** STORE-007, STORE-008

**Objective:** Turn `membersOnly` product flags into active conversion pressure — making exclusivity visible and desirable rather than just blocking non-members.

**In scope:**

- `apps/web/app/(store)/page.tsx` (catalog) and `apps/web/app/(store)/produtos/[id]/page.tsx` (detail):
  - **Non-member, membersOnly product**: product card and detail page remain fully visible; CTA button is **blurred** (`blur-sm pointer-events-none`) with an overlay: `"🔒 Exclusivo para Sócios — Seja Sócio para comprar"` → `/signup`
  - **Active member, membersOnly product**: show a gold `"✓ Sócio"` badge on the product card; CTA works normally
  - **Suspended member**: overlay text changes to `"Regularize sua assinatura para desbloquear"` → `/dashboard`
- The product image and details are always fully visible — only the CTA is gated
- Use `useSession()` to determine member state client-side; render a skeleton on the CTA while session loads to avoid layout shift

**Acceptance criteria:**

- [ ] Non-member sees blurred CTA and overlay (not a blank button)
- [ ] Active member sees no overlay and can add to cart normally
- [ ] Suspended member sees the regularization message (not the signup message)
- [ ] Product image and price are visible to all users
- [ ] No layout shift while session loads (skeleton CTA placeholder)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-012 — Store — stock scarcity indicators

**Phase:** 2 · Engagement Layer  
**Size:** S  
**Depends on:** STORE-007, STORE-008, STORE-004

**Objective:** Surface stock urgency signals on `ESTOQUE_FIXO` products to apply loss aversion — "I might miss out" is a stronger motivator than "I could gain."

**In scope:**

- `GET /store/products` and `GET /store/products/:id` — extend response to include `stockQuantity` and `stockAlertThreshold` per variant (already in the Prisma model; just expose in the serialized response)
- `apps/web/app/(store)/page.tsx` — product card:
  - When `stockQuantity <= stockAlertThreshold`: show `"Últimas {stockQuantity} unidades!"` badge in amber below the price
  - When `stockQuantity === 0`: show `"Esgotado"` badge in red + `"Avise-me quando voltar"` button (email capture modal — stores to a `StockNotification` table: `{ email, variantId, createdAt }` — add this table in a migration)
  - When `stockQuantity < initialStockQuantity * 0.2`: show `"🔥 Vendendo rápido"` label (requires `initialStockQuantity` field on `ProductVariant` — add to migration alongside `StockNotification`)
- `SOB_DEMANDA` products: none of the above indicators apply — they are hidden for those variants

**Acceptance criteria:**

- [ ] "Últimas X unidades!" badge only appears when `stockQuantity <= stockAlertThreshold`
- [ ] "Avise-me" email capture stores the record and confirms via toast
- [ ] `SOB_DEMANDA` variants show no stock indicators
- [ ] `pnpm --filter web typecheck` passes

---

### UX-013 — Dashboard — delinquency recovery UX

**Phase:** 2 · Engagement Layer  
**Size:** M  
**Depends on:** MEMBER-019, MEMBER-009, UX-001

**Objective:** Replace the static red delinquency banner with a dynamic, escalating UX that frames delinquency as *losing benefits* (loss aversion) rather than a payment reminder — 2× more motivating according to Kahneman.

**In scope:**

- `GET /members/me` — extend response with `daysSincePeriodEnd: number | null` (computed from `subscription.currentPeriodEnd` if status is PENDING or SUSPENDED)
- `apps/web/components/member/DelinquencyBanner.tsx` — dynamic banner with 4 states:

| State | Days | Color | Content |
|-------|------|-------|---------|
| Warning | D+1 to D+14 | Yellow | `"Sua assinatura vence em X dias. Regularize para manter seus benefícios."` + countdown |
| Urgent | D+15 to D+29 | Orange | `"Último aviso — sua carteirinha será desativada em X dias."` + CSS opacity animation on card preview |
| Suspended | D+30+ | Red | List of lost benefits (✗ Carteirinha, ✗ Desconto na loja, ✗ Voto em assembleias) + one-click reactivation CTA |
| Reactivated | just reactivated | — | Confetti animation (reuse from UX-006) + `"Que bom ter você de volta!"` |

- **Fading card animation** (D+15-29): renders the membership card preview at `opacity: 0.3` with a CSS `animation: pulse 2s ease-in-out infinite` to make the loss tangible
- **One-click reactivation** (D+30+): button `"Regularize agora"` → `/checkout?planId={currentPlanId}&reactivate=true`; the checkout page detects `reactivate=true` query param and skips plan selection
- `apps/web/app/(member)/dashboard/page.tsx` — replace existing static banner with `<DelinquencyBanner subscription={subscription} />`

**Acceptance criteria:**

- [ ] Yellow banner renders correctly for a subscription at D+3 (mocked API)
- [ ] Orange banner renders correctly for D+20 with the fading card animation
- [ ] Red banner shows the correct lost-benefits list for D+30+
- [ ] Reactivation button navigates to the correct checkout URL
- [ ] Reactivation confetti fires after the checkout success redirect
- [ ] ACTIVE members see no banner
- [ ] `pnpm --filter web typecheck` passes

---

### UX-014 — Dashboard — gamification redesign

**Phase:** 2 · Engagement Layer  
**Size:** L  
**Depends on:** MEMBER-019, MEMBER-011

**Objective:** Transform the numerical points display into a named-tier progression system with visual badges and a leaderboard teaser — applying variable rewards and the endowed progress effect.

**In scope:**

- `apps/web/lib/gamification.ts` — tier definitions:
  ```typescript
  const TIERS = [
    { name: "Torcedor", min: 0,    max: 99,   color: "brand-surface" },
    { name: "Camisa 10", min: 100, max: 499,  color: "brand-primary" },
    { name: "Ídolo",    min: 500,  max: 999,  color: "brand-secondary" },
    { name: "Lenda",    min: 1000, max: Infinity, color: "brand-accent" },
  ] as const;
  export function getTier(points: number): Tier { /* ... */ }
  export function getProgressToNextTier(points: number): { pct: number; remaining: number } { /* ... */ }
  ```
- `apps/web/components/member/GamificationCard.tsx`:
  - **Tier badge**: tier name + tier-colored pill background
  - **Progress bar**: `"Faltam {N} Escudos para {nextTier.name}"` with animated fill using `brand-primary`
  - **Recent activity feed**: last 5 `GamificationEvent` records rendered as `"🏟️ Check-in vs. {opponent}: +{N} Escudos"` with relative timestamps; event type → emoji map in `gamification.ts`
  - **Badge showcase**: grid of milestone badges (1st check-in, 5 referrals, 12-month streak, 1st vote) — locked badges shown as grayscale with tooltip `"Complete X para desbloquear"`
  - **Leaderboard teaser**: `"Você está em #{rank} no ranking"` with link to `GET /leaderboard` page; only shown if member opted in via `showOnLeaderboard`
- `GET /members/me/points` — must return `{ total, rank, recentEvents: GamificationEvent[], badges: Badge[] }` — add `rank` computed via `RANK() OVER (ORDER BY points DESC)` SQL query

**Acceptance criteria:**

- [ ] Correct tier name and color for a member with 150 points (Camisa 10)
- [ ] Progress bar percentage is accurate (`(150-100)/(500-100) = 12.5%`)
- [ ] Recent activity feed shows at most 5 events
- [ ] Locked badges are visually distinct from earned badges
- [ ] Leaderboard teaser is absent when `showOnLeaderboard === false`
- [ ] `pnpm --filter web typecheck` passes

---

### UX-015 — Public — collective impact visualization

**Phase:** 2 · Engagement Layer  
**Size:** M  
**Depends on:** MEMBER-022, MEMBER-015, UX-001

**Objective:** Make the member counter on `/socios` emotionally visceral — animating the count, rotating impact phrases, and personalizing the experience for logged-in members.

**In scope:**

- `apps/web/app/(public)/socios/page.tsx`:
  - **Animated count-up**: on page mount, animate from 0 to current member count over 1.5s using a `useCountUp` hook (implement internally; no new dependency); uses `requestAnimationFrame`
  - **Rotating impact phrases**: every 4 seconds, cycle through admin-configured goal phrases from `GET /stats/members` (`goals[].label`); implement with `useState` + `setInterval` + CSS `fade-in`/`fade-out` transition
  - **"Your brick" indicator** (authenticated members only): `"Você é o sócio nº {memberNumber}. Sua contribuição está aqui →"` rendered below the main counter with an arrow pointing to it; uses `useSession()`
  - **Stadium fill visualization**: a simplified stadium SVG (custom, not an image) where seats are colored as members join; at 200 members = 20% colored, 1000 = 100%; seats use `brand-primary` fill; SVG embedded inline, no external dependency
- `apps/web/components/socios/StadiumFill.tsx` — isolated SVG component; `fill` prop is a percentage
- No changes to the backend; all data comes from the existing `GET /stats/members` endpoint

**Acceptance criteria:**

- [ ] Count-up animation completes without jitter (no layout shift)
- [ ] Impact phrases rotate every 4 seconds
- [ ] "Your brick" indicator is visible to logged-in members and absent for anonymous visitors
- [ ] Stadium fill percentage corresponds to `(memberCount / 1000) * 100` (cap at 100%)
- [ ] Page is accessible to unauthenticated visitors
- [ ] `pnpm --filter web typecheck` passes

---

### UX-016 — Membership card — visual redesign

**Phase:** 2 · Engagement Layer  
**Size:** M  
**Depends on:** MEMBER-020, UX-001

**Objective:** Redesign the membership card from a data display into a premium identity object — making it something members are proud to show at the gate and share on social media.

**In scope:**

- `apps/web/app/(member)/card/page.tsx`:
  - **Card visual**: full-width card container with tier-colored gradient background (`--brand-gradient` adjusted per tier using CSS `hue-rotate`); club crest (`<ClubCrest>` from UX-001) top-left; member name in `--font-display`; tier badge; member number; validity date bottom-right
  - **Holographic shimmer**: CSS-only `@keyframes shimmer` using `background: linear-gradient` with `background-position` animation; `animation: shimmer 3s ease-in-out infinite`
  - **Active status pulse**: green `box-shadow` with CSS pulse animation on active cards; gray for suspended
  - **"Sócio desde {year}"** badge using `subscription.createdAt`
  - **"Mostrar na entrada" button**: enters full-screen mode via `document.documentElement.requestFullscreen()` + boosts brightness to `filter: brightness(1.3)` on the card container (replaces existing `body` brightness boost)
  - **Shareable version button**: generates a `<canvas>` image with the card design but QR replaced with a blurred placeholder; `canvas.toBlob()` → `navigator.share()` or download fallback; label: `"Mostre com orgulho 📸"`
- Suspended card renders with `opacity: 0.5` and a red `"SUSPENSO"` watermark text overlay

**Acceptance criteria:**

- [ ] Tier gradient changes for different plan tiers
- [ ] Shimmer animation plays continuously and is GPU-accelerated (`transform: translateX`)
- [ ] "Mostrar na entrada" enters full-screen on mobile
- [ ] Shareable version blurs the QR code area (not the entire card)
- [ ] Suspended member sees the SUSPENSO watermark and no full-screen option
- [ ] `pnpm --filter web typecheck` passes

---

### UX-017 — Dashboard — voting rights celebration

**Phase:** 2 · Engagement Layer  
**Size:** S  
**Depends on:** MEMBER-012, MEMBER-019

**Objective:** Turn voting eligibility from a backend flag into a celebrated achievement — applying the Ikea effect (people value things more when they've earned them).

**In scope:**

- `apps/web/components/member/VotingRightsWidget.tsx`:
  - **Pre-eligibility (< 12 months streak)**: progress bar `"Faltam {12 - streak} meses para seu direito de voto"` with monthly progress; label: `"Votante em X meses"`
  - **Unlock notification**: one-time toast on first dashboard load after eligibility is reached: `"🗳️ Parabéns! Você conquistou o direito de voto. Agora o Tubarão é realmente seu."` — tracked via `localStorage` key `"voting_unlocked_notified_{memberId}"`
  - **Active polls showcase**: when polls are open and member is eligible, render a `"Sua voz importa 🗳️"` banner with a link to `/(member)/polls` and the number of open polls
  - **Post-vote confirmation**: on the poll page, after submitting a vote, show `"Obrigado! Sua voz foi registrada. Resultado divulgado em {closesAt}."` inline below the voted option
- Mount `<VotingRightsWidget />` in the member dashboard below the subscription status section

**Acceptance criteria:**

- [ ] Progress bar shows correct months remaining (verified for a member with 8-month streak)
- [ ] Unlock toast fires exactly once (localStorage check prevents re-fire on refresh)
- [ ] Active polls badge shows correct count
- [ ] Post-vote confirmation shows correct result date
- [ ] `pnpm --filter web typecheck` passes

---

## Phase 3 — Polish & Growth

---

### UX-018 — Homepage — recently joined social proof ticker

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** UX-002, MEMBER-015

**Objective:** Add a non-intrusive notification ticker showing real-time member joins on the homepage and `/socios` page.

**In scope:**

- `GET /stats/members/recent` — new public endpoint; returns the last 10 members who activated (only those with `marketingConsent: true`); returns `[{ firstName: string, city?: string, joinedAt: ISO }]` — no email, CPF, or surname
- `apps/web/components/home/RecentJoinTicker.tsx` — fixed `position: fixed; bottom: 1.5rem; left: 1.5rem; z-index: 50` notification card; renders `"João M. de Tubarão acabou de se tornar sócio"`; cycles through the list every 8 seconds with CSS slide-in/slide-out; pauses on hover
- Dismiss button (`✕`) hides the ticker for the session (sessionStorage)
- Mounted on `/(public)/page.tsx` and `/(public)/socios/page.tsx` only
- No server-sent events; poll `GET /stats/members/recent` every 60s

**Acceptance criteria:**

- [ ] Ticker only shows names with `marketingConsent: true`
- [ ] Ticker cycles through entries every 8 seconds
- [ ] Dismiss button hides it for the session
- [ ] Does not render on `(member)` or `(admin)` routes
- [ ] `pnpm --filter web typecheck` passes

---

### UX-019 — Signup/plans — exit-intent capture

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** MEMBER-016, MEMBER-017

**Objective:** Recover abandoning visitors with an exit-intent modal that captures emails for a nurture campaign.

**In scope:**

- `apps/web/components/shared/ExitIntentModal.tsx` — modal triggered on `document.addEventListener("mouseleave", ...)` when `event.clientY <= 0` (cursor moves toward browser chrome); desktop only (detect via `window.matchMedia("(pointer: fine)")`)
- Modal content: headline `"Ainda pensando? O Tubarão precisa de você."`, current member count (from `GET /stats/members`), email input, `"Receber lembrete"` button → `POST /waitlist` (new endpoint; stores `{ email, source: "exit_intent" }` in a `Waitlist` table: `id, email, source, createdAt, unique(email)`)
- Fires once per browser session (sessionStorage key `"exit_intent_shown"`)
- Mounted on `/(public)/signup` and `/(member)/plans` pages via a `useExitIntent()` hook
- `POST /waitlist` — new Fastify route (admin-only `GET /admin/waitlist` for export); no auth required for POST

**Acceptance criteria:**

- [ ] Modal fires when cursor exits the top of the viewport on desktop
- [ ] Modal does not fire on mobile (touch devices)
- [ ] Modal fires at most once per session
- [ ] Email submission returns `201` and shows a confirmation toast
- [ ] Duplicate email returns `200` (silent dedup — not a 409)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-020 — Dashboard — WhatsApp-first communication

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** MEMBER-019, MEMBER-014

**Objective:** Leverage the existing `whatsappOptIn` field throughout the member journey — making WhatsApp the primary sharing and notification channel (Brazil-specific best practice).

**In scope:**

- `apps/web/app/(member)/dashboard/page.tsx` — WhatsApp opt-in prompt: if `whatsappOptIn === false` and member has been active for > 7 days, show a dismissable `Card`: `"Quer receber novidades do Tubarão pelo WhatsApp?"` with `"Sim, quero!"` toggle → `PATCH /members/me { whatsappOptIn: true }` + dismiss button (stores dismissal in `Member.whatsappOptInDismissedAt`)
- `apps/web/components/member/ReferralCard.tsx` (from UX-007) — ensure WhatsApp share is the primary (leftmost, larger) button
- `apps/web/app/(member)/card/page.tsx` — add WhatsApp share option: `"Compartilhar carteirinha"` → generates shareable image (from UX-016) and triggers WhatsApp share via `navigator.share` or fallback deep link
- Email templates (Delinquency D+7, D+15) — add WhatsApp deep link as a secondary CTA: `"Ou fale conosco pelo WhatsApp: {whatsapp_url}"` — requires the club's WhatsApp support number in env var `WHATSAPP_SUPPORT_NUMBER`
- Add `whatsappOptInDismissedAt: DateTime?` to `Member` model + migration

**Acceptance criteria:**

- [ ] Opt-in prompt appears for members active > 7 days with `whatsappOptIn: false`
- [ ] Dismissing the prompt sets `whatsappOptInDismissedAt` and hides it permanently
- [ ] WhatsApp share is the first/primary button on the referral card
- [ ] Delinquency D+7 email includes the WhatsApp support link
- [ ] `pnpm --filter web typecheck` passes

---

### UX-021 — Plan selection — annual pricing nudge

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** MEMBER-017

**Objective:** Default the monthly/annual toggle to annual and emphasize savings — making the better-value option the path of least resistance.

**In scope:**

- `apps/web/app/(member)/plans/page.tsx`:
  - Change toggle default from `"monthly"` to `"annual"` (state initialization: `const [interval, setInterval] = useState<"monthly" | "annual">("annual")`)
  - When `"annual"` is selected: show price as `"R${annualPrice / 12}/mês"` with `"cobrado anualmente"` subscript
  - Show total savings: `"Economize R${(monthlyPrice * 12) - annualPrice}/ano"` in a green `Badge`
  - `"Melhor Custo-Benefício"` badge on the annual toggle option (not on the plan card — on the toggle button itself)
  - Add a `"Preferir mensal"` text link below the toggle for opting out

**Acceptance criteria:**

- [ ] Toggle defaults to annual on page load
- [ ] Annual price is displayed as monthly equivalent with correct math
- [ ] Savings badge shows the correct annual saving
- [ ] Switching to monthly shows the correct monthly price
- [ ] `pnpm --filter web typecheck` passes

---

### UX-022 — Transparency — last updated indicator

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** TRANS-008, UX-009

**Objective:** Add an accountability timestamp to the transparency portal — creating internal pressure to keep data current and reassuring visitors.

**In scope:**

- `GET /transparency/posts?limit=1&orderBy=publishedAt_desc` — used to compute the last publication date
- `apps/web/app/(public)/transparencia/layout.tsx` — add a persistent header strip: `"Portal atualizado em {DD/MM/YYYY}"` using the most recent `publishedAt`
- If the last publication was > 45 days ago: replace with an amber `Alert`: `"⚠️ Publicação pendente — a última atualização foi há {N} dias."` — this creates visible accountability pressure on the admin team
- The layout component is a server component; fetch once per ISR cycle (revalidation: 3600s — hourly)

**Acceptance criteria:**

- [ ] Timestamp is visible on all `/transparencia/*` sub-pages
- [ ] Amber warning renders when last publication is > 45 days ago (testable by mocking the date)
- [ ] Date format is `DD/MM/YYYY` (Brazilian locale — use `toLocaleDateString("pt-BR")`)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-023 — Transparency — debt reduction celebration milestones

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** TRANS-011

**Objective:** Auto-detect when total remaining debt crosses milestone thresholds and surface a celebratory announcement on the transparency portal.

**In scope:**

- `apps/api/src/jobs/debt-milestone-check.ts` — BullMQ processor invoked after every `DebtSnapshot` creation; computes `pctPaid = totalPaid / totalOriginal * 100`; compares against milestones `[25, 50, 75, 100]`; if a new milestone is crossed (check against `AnnouncementBanner` table — requires DATA-006), creates an `AnnouncementBanner` with text `"🎉 O Tubarão já pagou {N}% da dívida total!"`, `color: "brand-primary"`, `expiresAt: now + 30 days`
- `apps/web/app/(public)/transparencia/layout.tsx` — render active `AnnouncementBanner` records above the portal header; fetch from new `GET /transparency/announcements` public endpoint
- `GET /transparency/announcements` — returns active `AnnouncementBanner` records where `isActive: true AND (expiresAt IS NULL OR expiresAt > now)` — no auth required
- Shareable text: clicking the announcement banner opens a share modal with pre-filled text for WhatsApp and Twitter/X
- Milestone check is also triggerable manually from `POST /admin/transparency/debts/snapshot` (after snapshot creation, enqueue the check job)

**Acceptance criteria:**

- [ ] AnnouncementBanner is created when `pctPaid` crosses 25% for the first time
- [ ] Same milestone does not create duplicate banners (check before creating)
- [ ] Banner renders on the transparency portal homepage
- [ ] Banner expires after 30 days (does not render after `expiresAt`)
- [ ] Share text is pre-filled and accurate
- [ ] `pnpm --filter web typecheck` passes

---

### UX-024 — Accessibility — WCAG 2.1 AA hardening

**Phase:** 3 · Polish & Growth  
**Size:** L  
**Depends on:** UX-002, UX-009, TRANS-008

**Objective:** Bring all public-facing pages to WCAG 2.1 AA compliance — with specific focus on the transparency portal (creditors, journalists, and older fans are primary users).

**In scope:**

- **Color contrast audit**: run `axe-core` programmatically via a Vitest/Playwright test against all `(public)` routes; fail CI if any `critical` or `serious` violation is found; fix all violations (4.5:1 for body text, 3:1 for large text and UI components)
- **Focus indicators**: add `focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2` to all interactive elements in `packages/ui` components where missing; do not use `outline: none` without a visible replacement
- **Skip-to-content link**: add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Pular para o conteúdo</a>` as the first element in every `(public)` layout component
- **`aria-live` regions**: wrap the member counter on `/socios`, the debt totals on the transparency portal, and the delinquency countdown in `<div aria-live="polite" aria-atomic="true">`
- **Table semantics**: update the debt creditor table in `TRANS-011` to use `<th scope="col">` headers, a `<caption>`, and `role="table"` if using non-semantic markup
- **PDF accessibility note**: add `"Documentos em PDF podem não ser acessíveis a leitores de tela. Contate-nos para solicitar formato alternativo."` below any PDF download link
- `playwright.config.ts` — add `axe-playwright` accessibility scan to the E2E test suite for all `(public)` routes; fail on WCAG 2.1 AA violations at `critical` severity

**Acceptance criteria:**

- [ ] `axe-core` reports zero `critical` violations on `/(public)`, `/(public)/transparencia`, `/(public)/socios`, and `/(public)/signup`
- [ ] Tab navigation reaches all interactive elements visibly
- [ ] Skip-to-content link is the first focusable element on all public pages
- [ ] Screen reader announces live member count updates
- [ ] Debt table has correct semantic structure
- [ ] `pnpm --filter web typecheck` passes

---

### UX-025 — Public — monument wall page

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** MEMBER-019, UX-001

**Objective:** Create the digital "Wall of Founders" — a visual mosaic of opted-in member names — reinforcing the belonging narrative and incentivizing `showOnMonument` opt-in.

**In scope:**

- `GET /members/monument` — new public endpoint; returns `[{ firstName: string, lastInitial: string, tier: string, joinedAt: ISO }]` for all members where `showOnMonument: true AND subscription.status = ACTIVE`; no PII beyond first name + last initial
- Route: `/(public)/muro` — SSR + ISR revalidation 300s
- **Wall grid**: CSS grid, each cell is a "brick" — a `div` with `bg-brand-surface border border-brand-primary/20 rounded p-2` containing the member name in small text; tile color accent varies by tier using `badgeColor` (requires DATA-001)
- **Animation**: bricks appear sequentially on page load using CSS `animation-delay` staggered by index (0–100 items; beyond 100 use batch animation)
- **Logged-in member highlight**: if the member's name is in the list, it has a `ring-2 ring-brand-secondary` highlight and a `"Seu nome está aqui 🧱"` tooltip
- **CTA for non-opted-in members**: sticky footer CTA (for logged-in members without `showOnMonument`): `"Quero fazer parte do muro"` → `PATCH /members/me { showOnMonument: true }`; shows optimistic UI
- **CTA for non-members**: `"Seja sócio para estar no Muro dos Fundadores"` → `/signup`
- **Physical monument note**: `"Estes nomes serão eternizados na sede do clube"` in the page subtitle

**Acceptance criteria:**

- [ ] Only members with `showOnMonument: true` and `ACTIVE` subscription appear
- [ ] Logged-in member's brick is highlighted correctly
- [ ] Opt-in CTA updates `showOnMonument` and adds the brick optimistically
- [ ] Page is accessible without authentication
- [ ] `pnpm --filter web typecheck` passes

---

### UX-026 — Dashboard — match-day engagement loop

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** MEMBER-028, MEMBER-011, MEMBER-019

**Objective:** Add a match-day engagement widget to the member dashboard — closing the pre-game → check-in → post-game emotional arc.

**In scope:**

- `GET /admin/events?upcoming=true&limit=1` — extend to be accessible to authenticated members (not just admins); returns the next `MatchEvent` with `date, opponent, competition`
- `apps/web/components/member/MatchDayWidget.tsx`:
  - **Pre-match** (event exists, not yet occurred): `"🏟️ Próximo jogo: Tubarão vs. {opponent}"` + date in Brazilian locale + countdown timer (days/hours) using `useEffect` + `setInterval`; `"Não esqueça o check-in para ganhar {basePoints} Escudos"` subtext
  - **Match day** (event date === today): prominent CTA `"Faça seu check-in agora!"` → `/(member)/card`
  - **Post-match** (event date < today, within 48h): if check-in exists for this event in `GamificationEvent`, show `"Você esteve lá! +{N} Escudos conquistados"` with a `"🏟️"` emoji; if no check-in, show `"Perdeu o check-in? Não perca o próximo!"`
  - **Streak tracker**: `"🔥 {N} jogos seguidos com check-in!"` — count consecutive `CHECKIN` events across sequential `MatchEvent` records
- Mount `<MatchDayWidget />` in the member dashboard above the points section

**Acceptance criteria:**

- [ ] Pre-match widget shows the correct opponent and countdown for the next event
- [ ] Match-day CTA appears only on the event date
- [ ] Post-match widget shows correct points for members who checked in
- [ ] Streak count is correct (verified for a member with 3 consecutive check-ins)
- [ ] Widget is absent when no upcoming events exist (no empty state visible)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-027 — Dashboard — anniversary & milestone celebrations

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** MEMBER-011, MEMBER-019

**Objective:** Celebrate member loyalty milestones with targeted in-app notifications and gamification events.

**In scope:**

- `apps/api/src/jobs/streak-milestone-check.ts` — invoked by the monthly streak job (MEMBER-026) after incrementing `adimplenciaStreakMonths`; checks for milestones at `[6, 12, 24, 36, 60]` months; if crossed: enqueues `send-email` job with the corresponding template + records a `GamificationEvent` (`STREAK_MILESTONE`) with bonus points defined per milestone in config
- `apps/api/src/jobs/anniversary-check.ts` — daily BullMQ job (cron: `0 8 * * *`); finds members whose `subscription.createdAt` anniversary is today; records `ANNIVERSARY` gamification event + enqueues anniversary email
- Collective milestone (member count crossing 100/250/500/1000): tracked in `apps/api/src/jobs/process-payment-event.ts` — after activating a subscription, check total active count; if a milestone is crossed, create an `AnnouncementBanner` (DATA-006)
- `apps/web/components/member/MilestoneToast.tsx` — reads `recentGamificationEvents` from dashboard API; if any event is within the last 24h and is of type `STREAK_MILESTONE` or `ANNIVERSARY`, shows a confetti toast (reuse UX-006 pattern) on dashboard mount; tracked via `localStorage` to prevent repeat

**Acceptance criteria:**

- [ ] A member whose subscription created date matches today receives an anniversary email
- [ ] 6-month streak milestone records a `STREAK_MILESTONE` event exactly once
- [ ] Collective milestone banner appears on the transparency portal after 500 members activate
- [ ] Milestone toast fires on the dashboard the day the event is recorded
- [ ] Toast does not fire again on subsequent visits (localStorage check)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-028 — Profile — community identity markers

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** MEMBER-019, UX-001

**Objective:** Add visible identity signals to the member profile — tier-colored avatars, tenure badges, and a "Fundador" tag — reinforcing belonging and social identity.

**In scope:**

- `apps/web/components/shared/MemberAvatar.tsx` — new component: `<ClubCrest>` (UX-001) overlaid on a circle background colored with the member's plan `accentColor` (DATA-001); accepts `size`, `tier`, and optional `avatarUrl` props; if `avatarUrl` is set, shows the photo instead of crest; fallback to crest + tier color
- `apps/web/components/shared/TenureBadge.tsx` — renders `"Membro desde {year}"` in a small muted pill; appears on the leaderboard entries, poll vote list (where applicable), and the member profile header
- **"Fundador" tag**: add `isFounder: boolean` computed field to `GET /members/me` — `true` if `subscription.createdAt < platform_launch_date + 180 days` (config constant `FOUNDER_CUTOFF_DATE` in env); render a gold `"Fundador 🏆"` badge on the profile and leaderboard
- Update leaderboard response (`GET /leaderboard`) to include `tier`, `memberSince`, `isFounder` per entry
- Replace existing initials-based avatar wherever it appears with `<MemberAvatar />`

**Acceptance criteria:**

- [ ] Avatar shows tier color for members without a photo
- [ ] "Fundador" badge appears for members who joined within the first 6 months
- [ ] "Fundador" badge is absent for members who joined later
- [ ] Leaderboard entries include tier and tenure information
- [ ] `pnpm --filter web typecheck` passes

---

### UX-029 — Email — emotional template design

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** MEMBER-014

**Objective:** Redesign all member lifecycle email templates with club branding and emotionally resonant copy — replacing placeholder or generic templates.

**In scope:**

Update all templates in `apps/api/src/emails/` with:
- **Club header**: `<ClubHeader />` sub-component — club crest image (R2-hosted), club name in display font, `brand-primary` background strip
- **Footer**: contact email, unsubscribe link, LGPD notice, social media icons (WhatsApp, Instagram)
- **Mobile-responsive layout**: `max-width: 600px` centered, `padding: 0 16px` on mobile

Emotional copy per template:

| Template | Subject | Key Emotional Copy |
|----------|---------|-------------------|
| `WelcomeEmail` | `"Bem-vindo à família, {name}! 🦈"` | `"A torcida ficou maior. Você agora é parte da reconstrução."` |
| `PaymentConfirmedEmail` | `"Mais um mês de reconstrução. Obrigado."` | `"Sua contribuição de R${amount} chegou. O Tubarão avança."` |
| `DelinquencyD1Email` | `"O Tubarão sente sua falta, {name}"` | `"Sua contribuição faz diferença. Regularize para continuar fazendo parte."` |
| `DelinquencyD15Email` | `"Último aviso — sua carteirinha será desativada"` | `"Em {suspensionDate}, sua carteirinha e acesso à loja serão suspensos."` |
| `SuspensionEmail` | `"Sua carteirinha foi desativada"` | `"Clique abaixo para reativar e voltar à reconstrução."` |
| `ReactivationEmail` | `"Que bom ter você de volta! 🎉"` | `"O Tubarão é mais forte com você. Sua carteirinha está ativa novamente."` |
| `ReferralSuccessEmail` | `"{ReferredName} entrou por sua indicação!"` | `"+{N} Escudos creditados. Obrigado por trazer mais um tijolo."` |
| `VotingUnlockedEmail` | `"🗳️ Seu voto agora conta, {name}"` | `"12 meses de contribuição ininterrupta. A democracia do Tubarão te espera."` |
| `AnniversaryEmail` | `"1 ano juntos, {name}! 🦈"` | `"Um ano de reconstrução. Você é parte da história do Tubarão."` |

**Acceptance criteria:**

- [ ] All 9 templates render without error in `pnpm email:preview`
- [ ] All templates are mobile-responsive at 375px width (verified in preview)
- [ ] Club crest is visible in all templates (not broken image)
- [ ] Unsubscribe link is present in all templates
- [ ] `{name}`, `{amount}`, `{suspensionDate}` etc. are properly typed via TypeScript template props
- [ ] `pnpm --filter api typecheck` passes

---

### UX-030 — Transparency — creditor deep links

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** TRANS-011

**Objective:** Give each creditor a permanent, shareable URL so creditors can bookmark their own status page.

**In scope:**

- Add `slug: string` (unique) field to `DebtRecord` model + migration + Zod schema; auto-generated from `creditorName` using `slugify` (e.g., `"Prefeitura Municipal"` → `"prefeitura-municipal"`) on creation; editable by admin
- `GET /transparency/debts/:slug` — new public endpoint returning a single debt record with all payment history
- Route: `/(public)/transparencia/dividas/[slug]/page.tsx` — renders creditor name, status badge, original/negotiated/paid/remaining amounts, public notes, and a simple payment timeline; SSR + ISR revalidation 3600s
- Update the debt dashboard table (TRANS-011) to make creditor names clickable links to their deep-link page
- Canonical `<link rel="canonical">` tag in `generateMetadata()`

**Acceptance criteria:**

- [ ] `GET /transparency/debts/prefeitura-municipal` returns the correct debt record
- [ ] Page renders at `/(public)/transparencia/dividas/prefeitura-municipal`
- [ ] Creditor names in the debt dashboard table are clickable links
- [ ] Duplicate slugs are rejected with a `409` error on creation
- [ ] `pnpm --filter web typecheck` passes

---

### UX-031 — Transparency — SEO & structured data

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** TRANS-015, TRANS-008

**Objective:** Maximize search engine visibility and social sharing for the transparency portal — making financial publications discoverable by creditors, journalists, and fans.

**In scope:**

- **JSON-LD structured data** on `/(public)/transparencia/posts/[id]/page.tsx`: `Article` schema with `datePublished: publishedAt`, `dateModified: updatedAt || publishedAt`, `author: { "@type": "Organization", name: "Associação Desportiva Tubarão" }`, `publisher`, `headline`, `description`
- **Canonical URLs**: `generateMetadata()` on every transparency page includes `alternates: { canonical: absolute_url }`
- **Auto meta descriptions**: first 160 characters of `body` (strip markdown syntax — use a simple regex, not a full parser)
- **OG images per category**: create static OG image variants in `apps/web/public/og/`: one per `TransparencyCategory` value; `generateMetadata()` selects the correct one based on post category
- **`next/og`** (Vercel OG Image Generation): alternative to static — generate dynamic OG images including the post title and publication date at `/(public)/transparencia/posts/[id]/opengraph-image.tsx`; choose one approach, not both
- **Page speed**: verify ISR revalidation on all transparency pages is <= 300s (5 minutes); posts don't change often

**Acceptance criteria:**

- [ ] JSON-LD for a post page validates without errors at `https://validator.schema.org/`
- [ ] `<meta name="description">` content is the first 160 chars of `body` (no markdown syntax)
- [ ] Canonical tag is present and points to the absolute URL
- [ ] OG image renders correctly when a post URL is shared in WhatsApp (test via WhatsApp link preview)
- [ ] `pnpm --filter web typecheck` passes

---

### UX-032 — Transparency — third-party validation badges

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** TRANS-008

**Objective:** Surface any external or internal validation signals on the transparency portal to build authority.

**In scope:**

- `apps/web/components/transparency/ValidationBadge.tsx` — component accepting `{ label: string, description?: string, logoUrl?: string }`; renders as a small bordered card with logo (if available) and label; wraps in a `<Tooltip>` with description
- `apps/web/app/(public)/transparencia/page.tsx` — render a `ValidationBadges` section below the portal hero; initially populated with: `"Dados auditados internamente — relatório completo disponível para download"` (internal) + placeholder slot for future external certifications
- Badges are admin-configurable via the `AnnouncementBanner` model repurposed with a `type: "BADGE"` field (add `type: BadgeType` enum to the model — `ANNOUNCEMENT | BADGE`); `GET /transparency/announcements?type=BADGE`
- If `logoUrl` resolves to a 404 (check at build time via `next/image` error fallback), render a text-only badge

**Acceptance criteria:**

- [ ] At least the internal audit badge renders on the transparency portal homepage
- [ ] `<Tooltip>` shows the full description on hover
- [ ] Broken logo URL falls back to text-only badge gracefully
- [ ] `pnpm --filter web typecheck` passes

---

### DOC-002 — spec.md — marketing-aware persona JTBD

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** DOC-001

**Objective:** Extend each persona in `spec.md` with emotional and social jobs-to-be-done — so future developers understand the *why* behind every UX decision.

**In scope:**

- Edit `spec.md` § Personas — add a `JTBD` table after each persona definition:

| Persona | Functional Job | Emotional Job | Social Job |
|---------|---------------|---------------|------------|
| Sócio-Torcedor | Join a plan, pay monthly | Feel like I'm *saving* my club, not just subscribing | Tell friends I'm part of the rescue |
| Visitante Cético | Verify financial data | Feel reassured this isn't another empty promise | Share credible data with other skeptics |
| Parceiro/Patrocinador | Receive proof of ad delivery | Feel like a local hero, not just a vendor | Be seen as a "savior of a cultural asset" |
| Admin | Manage members and publish reports | Feel empowered to run the club well despite a small team | Demonstrate good governance to stakeholders |

- Add a `§ Behavioral Design Principles` section (2 paragraphs) referencing `docs/ux-strategy.md` as the authoritative guide

**Acceptance criteria:**

- [ ] JTBD table is present for all 4 personas in `spec.md`
- [ ] Cross-reference link to `docs/ux-strategy.md` is working
- [ ] No existing spec content is removed or modified (append-only)

---

### DOC-003 — docs/narrative-touchpoints.md

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** DOC-001

**Objective:** Create a map of every user-facing surface to its "Operation Rescue" narrative touchpoint — ensuring future developers never write generic copy.

**In scope:**

- `docs/narrative-touchpoints.md`:
  - Intro paragraph: why narrative consistency matters for a club's credibility
  - **Master table**: every route, email template, notification type, and error message mapped to: the narrative moment it represents, the required emotional register, and the copy anchor phrase from `apps/web/lib/copy.ts`
  - **Error message guidance**: even 404 and 500 errors should use club voice (`"Essa página se perdeu no campo. Volte para o início."`)
  - **Copy review checklist**: 5-question checklist developers run before merging any user-facing copy change
  - **Forbidden patterns**: generic SaaS language to avoid (`"Please try again"`, `"An error occurred"`, `"Your request has been submitted"`)

**Acceptance criteria:**

- [ ] Document covers all routes in the `(public)` and `(member)` route groups
- [ ] All 9 email templates are mapped
- [ ] Forbidden patterns section lists at least 10 specific phrases to avoid
- [ ] Document is referenced from `AGENTS.md` §Documentation

---

### DOC-004 — docs/INFO.md — expand into brand bible

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** DOC-001

**Objective:** Expand the existing 62-line `docs/INFO.md` into a full brand bible so visual and copy decisions have authoritative guidance.

**In scope:**

- Preserve all existing content in `docs/INFO.md`
- Add sections:
  1. **Brand Voice** — formal register for creditor communications, passionate register for fan-facing content; example rewrites of 5 generic phrases into club voice
  2. **Visual Identity** — colors (reference UX-001 tokens with `TODO` placeholders for official values), typography rules (`--font-display` for headlines, Inter for body), logo usage (clear space, minimum size, prohibited uses)
  3. **Photography & Imagery Direction** — approved subjects: stadium wide angles, fans holding scarves, youth players training; prohibited: generic stock photos, competitor imagery, low-resolution images; recommended sources
  4. **Content Calendar Template** — table structure for planning monthly transparency publications, match-day social content, and seasonal campaigns
  5. **Tone by Channel** — WhatsApp (casual, emoji-ok), email (formal-passionate hybrid), in-app copy (concise, action-oriented), admin panel (neutral, efficient)

**Acceptance criteria:**

- [ ] All 5 new sections are present in `docs/INFO.md`
- [ ] Existing content is unchanged
- [ ] Color token references point to `packages/config/design/tokens.ts`
- [ ] Photography section explicitly lists at least 3 prohibited image types

---

### DOC-005 — docs/acceptance/ — behavioral Gherkin scenarios

**Phase:** 3 · Polish & Growth  
**Size:** M  
**Depends on:** DOC-001

**Objective:** Populate the empty `docs/acceptance/` folder with Gherkin feature files covering the key behavioral UX features — so regression in persuasion design is caught early.

**In scope:**

Create the following files in `docs/acceptance/`:

- `social-proof.feature` — plan selection social proof (most popular badge, subscriber counts)
- `celebration-flow.feature` — post-signup welcome page (confetti, member number, share buttons)
- `delinquency-ux.feature` — all 4 delinquency banner states
- `gamification.feature` — tier progression, badge unlocking, leaderboard visibility
- `referral.feature` — referral code visibility, sharing, credit-on-payment logic
- `scarcity.feature` — members-only gate, stock indicators
- `accessibility.feature` — skip link, aria-live, focus indicators

Each file must follow Gherkin syntax (`Feature`, `Scenario`, `Given`/`When`/`Then`) and be executable via a future Playwright + Cucumber setup (file format only — no test runner wiring required in this task).

At minimum 3 scenarios per feature file (21 total scenarios across 7 files).

**Acceptance criteria:**

- [ ] All 7 feature files exist in `docs/acceptance/`
- [ ] Each file has at least 3 scenarios
- [ ] Gherkin syntax is valid (no step-definition code — only `.feature` files)
- [ ] `social-proof.feature` includes the scenario from `strategic_analysis.md §4.5` verbatim

---

### DOC-006 — docs/kpis.md — conversion metrics

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** DOC-001

**Objective:** Define what success looks like for the platform so the team has quantifiable targets for each phase.

**In scope:**

- `docs/kpis.md` with the following KPI definitions (each with: name, formula, current value, target, measurement method):

| KPI | Target |
|-----|--------|
| Signup conversion rate (visitor → payment completed) | 15–20% |
| Monthly churn rate (D+30 suspended / total active) | < 5% |
| Referral rate (new members via referral code) | > 25% |
| Transparency portal engagement (unique visitors/month) | Baseline TBD |
| Reactivation rate (suspended → active within 30 days) | > 40% |
| Check-in rate (members checking in per home match) | > 50% of local members |
| Annual plan adoption rate | > 60% of paid plans |
| WhatsApp opt-in rate | > 70% of members |

- For each KPI: data source (which API endpoint / database table / analytics event provides the data), recommended measurement cadence, and owner (admin role)
- Add a `§ Anti-Metrics` section: metrics the team should NOT optimize for (e.g., do not optimize for raw page views — optimize for member activations)

**Acceptance criteria:**

- [ ] All 8 KPIs are present with formulas and targets
- [ ] Each KPI includes a data source reference
- [ ] Anti-Metrics section exists with at least 3 examples

---

### DOC-007 — docs/webhooks/ — Mercado Pago payload documentation

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** MEMBER-007

**Objective:** Document the Mercado Pago webhook contract so future developers can understand the integration without reverse-engineering the code.

**In scope:**

- `docs/webhooks/mercadopago.md`:
  - Signature verification algorithm (step-by-step, matching `MEMBER-007` implementation)
  - Example JSON payloads for: `payment.approved`, `payment.rejected`, `payment.cancelled`, `subscription.updated` — each with annotations explaining how the field maps to the member lifecycle
  - State machine diagram (Mermaid) showing webhook → subscription status transitions
  - **Member lifecycle mapping table**:

| Event | Previous Status | New Status | Side Effects |
|-------|----------------|------------|--------------|
| `payment.approved` (first) | PENDING | ACTIVE | Generate card, send WelcomeEmail, record REFERRAL for referrer |
| `payment.approved` (recurring) | ACTIVE | ACTIVE | Renew card, send PaymentConfirmedEmail |
| `payment.rejected` | ACTIVE | PENDING | Begin delinquency counter |
| `payment.cancelled` | any | CANCELLED | Invalidate card, cancel MP preapproval |

- Note: the actual payload schemas are already in `src/modules/webhooks/` — this document adds human-readable context

**Acceptance criteria:**

- [ ] Document exists at `docs/webhooks/mercadopago.md`
- [ ] All 4 event types have example payloads
- [ ] Mermaid state machine diagram renders correctly in GitHub
- [ ] Signature verification section matches the implementation in MEMBER-007 exactly

---

### DOC-008 — ADR-002 to ADR-005 — behavioral design decisions

**Phase:** 3 · Polish & Growth  
**Size:** S  
**Depends on:** —

**Objective:** Document non-obvious behavioral design decisions as Architecture Decision Records — preventing future developers from reverting them without understanding the reasoning.

**In scope:**

Create 4 ADR files in `docs/adr/`:

- `ADR-002-annual-plan-pricing-display.md`: Why annual plans are displayed as monthly-equivalent prices → anchoring effect; include the research reference (Ariely's decoy effect)
- `ADR-003-loss-framing-delinquency.md`: Why the delinquency flow uses loss framing (`"Você perdeu: Carteirinha..."`) instead of payment reminders → Kahneman's loss aversion; cite that loss framing is 2× more motivating than equivalent gain framing
- `ADR-004-referral-credits-on-payment.md`: Why referral points are credited on *first payment* rather than *registration* → prevents gaming (a person could create fake accounts to farm referral points); trade-off: slower referral flywheel but more reliable data
- `ADR-005-socio-solidario-plan.md`: Why the lowest-tier "Sócio Solidário" plan exists despite minimal revenue → inclusion > revenue; the counter grows (social proof); community trust; fans who can't pay today may be able to pay next year; positions the club as values-driven

Each ADR follows the standard format: Status, Context, Decision, Consequences.

**Acceptance criteria:**

- [ ] All 4 ADRs exist in `docs/adr/`
- [ ] Each follows the Status / Context / Decision / Consequences format
- [ ] ADR-002 and ADR-003 cite the behavioral psychology principle by name
- [ ] ADR-004 explicitly documents the trade-off (not just the decision)

---

## Phase 4 — Data Model Enhancements

---

### DATA-001 — MembershipPlan — marketing schema fields

**Phase:** 4 · Data Model Enhancements  
**Size:** S  
**Depends on:** MEMBER-001, MEMBER-002

**Objective:** Add marketing-specific fields to `MembershipPlan` to support plan card badges, tier colors, and rich marketing copy.

**In scope:**

- `packages/db/prisma/schema.prisma` — add to `MembershipPlan`:
  - `slug           String   @unique` — URL-friendly identifier (auto-generated from `name`)
  - `highlightLabel String?` — e.g., `"Mais Popular"`, `"Melhor Valor"`, `"Recomendado"` — admin-configurable, rendered as a badge on the plan card
  - `accentColor    String?` — hex color for tier-colored UI elements (card gradient, avatar background); validated in Zod as a hex pattern (`/^#[0-9A-Fa-f]{6}$/`)
  - `marketingDescription String?` — rich text (markdown) for the plan card below the benefits list; rendered via `react-markdown`
- `packages/schemas/src/member.ts` — update `CreateMembershipPlanSchema` and `MembershipPlanResponseSchema` to include these fields
- Migration named `add_membership_plan_marketing_fields`
- `pnpm db:generate` after migration

**Acceptance criteria:**

- [ ] Migration applies cleanly to a fresh database
- [ ] `CreateMembershipPlanSchema.parse({ accentColor: "not-a-hex" })` throws
- [ ] `CreateMembershipPlanSchema.parse({ accentColor: "#006847" })` passes
- [ ] `GET /plans` response includes the new fields
- [ ] `pnpm typecheck` passes

---

### DATA-002 — Product — SEO & feature schema fields

**Phase:** 4 · Data Model Enhancements  
**Size:** S  
**Depends on:** STORE-001, STORE-002

**Objective:** Add SEO-friendly slug and homepage feature flag to `Product`.

**In scope:**

- `packages/db/prisma/schema.prisma` — add to `Product`:
  - `slug        String   @unique` — auto-generated from `name` on creation; editable by admin
  - `isFeatured  Boolean  @default(false)` — controls homepage store teaser (UX-002)
- `packages/schemas/src/store.ts` — update `CreateProductSchema`, `UpdateProductSchema`, `ProductResponseSchema`
- `GET /store/products` — add `?isFeatured=true` query parameter filter
- Route `/(store)/produtos/[slug]` — add slug-based URL alongside the existing ID-based route (redirect `/produtos/[id]` to `/produtos/[slug]` if accessed by ID)
- Migration named `add_product_seo_fields`

**Acceptance criteria:**

- [ ] Migration applies cleanly
- [ ] `GET /store/products?isFeatured=true` returns only featured products
- [ ] Duplicate slug returns `409` on `POST /admin/store/products`
- [ ] `/(store)/produtos/camisa-do-centenario` resolves correctly
- [ ] `pnpm typecheck` passes

---

### DATA-003 — Member — memberNumber & leaderboard opt-in

**Phase:** 4 · Data Model Enhancements  
**Size:** S  
**Depends on:** MEMBER-001, MEMBER-002

**Objective:** Add a sequential display member number and expose the `showOnLeaderboard` preference in Zod schemas.

**In scope:**

- `packages/db/prisma/schema.prisma` — add to `Member`:
  - `memberNumber Int @unique @default(autoincrement())` — display-only; set on creation; never changes even if member cancels/reactivates
- `packages/schemas/src/member.ts` — add `showOnLeaderboard: z.boolean().default(false)` to `UpdateMemberSchema` and `MemberResponseSchema`; add `memberNumber: z.number()` to `MemberResponseSchema`
- `GET /members/me` — include `memberNumber` and `showOnLeaderboard` in response
- `PATCH /members/me` — allow updating `showOnLeaderboard`
- Migration named `add_member_number_and_leaderboard_optin`
- For existing members: populate `memberNumber` via a migration script that assigns sequential numbers based on `createdAt ASC`

**Acceptance criteria:**

- [ ] New members receive a unique, sequential `memberNumber` on registration
- [ ] `memberNumber` never changes (immutable after creation)
- [ ] `PATCH /members/me { showOnLeaderboard: true }` updates correctly
- [ ] Existing members all have a `memberNumber` after migration (no NULLs)
- [ ] `pnpm typecheck` passes

---

### DATA-004 — Schema naming unification & address normalization

**Phase:** 4 · Data Model Enhancements  
**Size:** S  
**Depends on:** MEMBER-001, MEMBER-002, STORE-002

**Objective:** Fix two known inconsistencies in the schema: the `adimplenciaStreak` naming mismatch between Prisma and Zod, and the duplicated address schema between `Member` and `Order`.

**In scope:**

- **Naming unification**: the Prisma field is `adimplenciaStreakMonths` (added in MEMBER-008) but Zod schemas use `adimplenciaStreak`; rename Zod to `adimplenciaStreakMonths` everywhere; search all files in `apps/` and `packages/` for the old name and update; run `pnpm typecheck` to confirm no references remain
- **Address normalization**: `Member.address` is a `Json?` field with no enforced shape; `Order.shippingAddress` uses the `AddressSchema` from `packages/schemas/src/store.ts`; extract `AddressSchema` to `packages/schemas/src/common.ts` and import it in both `member.ts` and `store.ts`; update `PATCH /members/me` to validate address with the shared schema
- No data migration required (the Prisma field name is already `adimplenciaStreakMonths`; only Zod type names change)

**Acceptance criteria:**

- [ ] `pnpm typecheck` passes with zero references to the old `adimplenciaStreak` name
- [ ] `AddressSchema` is exported from `@repo/schemas` (via `packages/schemas/src/common.ts`)
- [ ] `PATCH /members/me { address: { invalidField: "x" } }` throws a `422` validation error
- [ ] `PATCH /members/me { address: { street: "...", city: "...", ... } }` (valid shape) succeeds

---

### DATA-005 — Testimonial model + admin CRUD

**Phase:** 4 · Data Model Enhancements  
**Size:** M  
**Depends on:** FOUND-006, FOUND-008

**Objective:** Add a `Testimonial` model to power future social proof sections — collecting and curating member and partner testimonials.

**In scope:**

- `packages/db/prisma/schema.prisma` — new model:
  ```
  model Testimonial {
    id         String   @id @default(cuid())
    name       String
    text       String   @db.Text
    tier       String?
    photoUrl   String?
    isApproved Boolean  @default(false)
    source     String?  // "member" | "partner" | "media"
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt
  }
  ```
- `packages/schemas/src/testimonial.ts` — `CreateTestimonialSchema`, `TestimonialResponseSchema`; export from `packages/schemas/src/index.ts`
- API routes (all ADMIN-only except the public GET):
  - `GET /testimonials` — public; returns `isApproved: true` testimonials only; cached in Redis for 300s
  - `POST /admin/testimonials`
  - `PATCH /admin/testimonials/:id` — includes `isApproved` toggle
  - `DELETE /admin/testimonials/:id` — hard delete (testimonials are not business-critical records)
- Migration named `add_testimonials`
- Stub UI: `/(admin)/depoimentos` — simple table with approve/reject toggle (no slide-over needed; inline toggle is sufficient)

**Acceptance criteria:**

- [ ] `GET /testimonials` returns only approved testimonials
- [ ] Unapproved testimonial does not appear in `GET /testimonials`
- [ ] `PATCH /admin/testimonials/:id { isApproved: true }` immediately makes it visible
- [ ] Redis cache for `GET /testimonials` is invalidated when a testimonial is approved or deleted
- [ ] `pnpm typecheck` passes

---

### DATA-006 — AnnouncementBanner model + frontend component

**Phase:** 4 · Data Model Enhancements  
**Size:** M  
**Depends on:** FOUND-006, FOUND-008, UX-001

**Objective:** Add an `AnnouncementBanner` model so admins can push site-wide and section-specific announcements without deployments — used by UX-023 (debt milestones), UX-032 (validation badges), and UX-027 (collective milestones).

**In scope:**

- `packages/db/prisma/schema.prisma` — new model:
  ```
  model AnnouncementBanner {
    id        String      @id @default(cuid())
    text      String
    link      String?
    color     String      @default("brand-primary")
    type      BannerType  @default(ANNOUNCEMENT)
    isActive  Boolean     @default(true)
    expiresAt DateTime?
    createdAt DateTime    @default(now())
    updatedAt DateTime    @updatedAt
  }
  enum BannerType { ANNOUNCEMENT BADGE MILESTONE }
  ```
- `packages/schemas/src/banner.ts` — `CreateAnnouncementBannerSchema`, `AnnouncementBannerResponseSchema`; export from `packages/schemas/src/index.ts`
- API routes:
  - `GET /announcements` — public; returns active banners (`isActive: true AND (expiresAt IS NULL OR expiresAt > now)`); supports `?type=ANNOUNCEMENT|BADGE|MILESTONE` filter; cached in Redis for 60s
  - `POST /admin/announcements`
  - `PATCH /admin/announcements/:id`
  - `DELETE /admin/announcements/:id` — sets `isActive: false` (soft delete)
- `packages/ui/src/components/AnnouncementBanner.tsx` — client component rendering a full-width strip with `text`, optional `link`, and background color from `color` field; mapped to CSS variable or Tailwind class via a safe allowlist; exported from `@repo/ui`
- Mount in `apps/web/app/(public)/layout.tsx` — fetches `GET /announcements?type=ANNOUNCEMENT` and renders above the page header
- Migration named `add_announcement_banners`
- Admin UI: `/(admin)/anuncios` — table with inline toggle for `isActive` and date picker for `expiresAt`

**Acceptance criteria:**

- [ ] Active banner renders on all `(public)` pages
- [ ] Expired banner (past `expiresAt`) does not render
- [ ] `type=BADGE` filter returns only badge-type records (for UX-032)
- [ ] Redis cache is invalidated when a banner is created, updated, or deleted
- [ ] Admin can create a banner expiring in 7 days and verify it disappears after that
- [ ] `pnpm typecheck` passes
