# DESIGN.md — UI/UX Standards for Clube Atlético Tubarão SAF

**This document is the visual source of truth for any AI agent working on the frontend (`apps/web`).**
The goal of this document is to eliminate agent guesswork regarding layouts, spacing, colors, and responsive behavior, ensuring a cohesive interface using Tailwind CSS v4 and shadcn/ui.

---

## 1. Design Principles and Narrative

The interface should reflect the club narrative described in `INFO.md`: **"Operação resgate" and radical transparency.**

- **Serious and Direct:** Avoid excessive animations or playful layouts. The interface deals with creditor money and the passion of wounded supporters. The design should inspire **institutional trust**.
- **Accessibility First:** Elderly creditors and the press will use the transparency portal. Contrast must be high (WCAG AA), and typography must remain highly readable.
- **Mobile-First:** 90% of traffic (especially stadium access and store usage) will come from smartphones. Design for 375px screens first.

---

## 2. Design Tokens (Tailwind & shadcn/ui)

The color palette should be mapped into the shadcn/ui CSS variables (`globals.css`). Agents must never use hardcoded hex colors (e.g. `text-[#123456]`), only the tokens below.

### 2.1 Color Palette (Base Theme Example)

_Note: Assuming the club's traditional visual identity (Blue, Black, and White)._

| shadcn/ui Token      | Tailwind Class                | Intended Usage                                                     |
| -------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `--background`       | `bg-background`               | Main page background (White in light mode, Zinc-950 in dark mode). |
| `--foreground`       | `text-foreground`             | Primary text (Zinc-950 in light mode, White in dark mode).         |
| `--primary`          | `bg-primary` / `text-primary` | Primary actions, CTAs. (Atlético Tubarão Blue — e.g. `blue-600`).  |
| `--secondary`        | `bg-secondary`                | Secondary actions, subtle card backgrounds (e.g. `zinc-100`).      |
| `--muted`            | `text-muted-foreground`       | Supporting text, placeholders, subtle borders.                     |
| `--destructive`      | `bg-destructive`              | Delete buttons, `ATRASADO` or `SUSPENDED` status badges (Red).     |
| `--success` (Custom) | `bg-success` / `text-success` | `ACTIVE`, `PAGO`, `EM_DIA` status badges (Emerald Green).          |
| `--warning` (Custom) | `bg-warning`                  | `PENDING`, `EM_NEGOCIACAO` status badges (Yellow/Orange).          |

### 2.2 Typography and Spacing

- **Global Font:** Inter (configured through `next/font`).
- **Spacing Scale:** Strictly follow the standard Tailwind scale (`p-4`, `m-6`, `gap-2`). Never use arbitrary values (`p-[17px]`).
- **Border Radius:** Use the configured `--radius` value of `0.5rem` (`rounded-lg` for cards, `rounded-md` for buttons and inputs). Avoid fully rounded borders (`rounded-full`), except for avatars and badges.

---

## 3. Layout Structures (Layout Shells)

The Next.js App Router contains four route groups. Each has a distinct layout.

### 3.1 `(public)` — Transparency Portal and Landing Pages

- **Header:** Fixed at the top (`sticky top-0`), opaque white background with a subtle bottom border (`border-b`). Logo on the left, text navigation on the right. On mobile, use a hamburger menu via the shadcn `Sheet` component.
- **Main:** Constrained max width (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
- **Footer:** Dark background (`bg-zinc-900 text-zinc-400`). Must display the CNPJ, Legal Entity Name, and a "Desenvolvido com Transparência" seal.

### 3.2 `(member)` — Member Dashboard

- **Mobile Navigation:** Fixed Bottom Navigation Bar with icons (`Home`, `Carteirinha`, `Loja`, `Perfil`). This should follow native app conventions.
- **Desktop Navigation:** Narrow left sidebar.
- **Header:** Only the current page title and a notifications button.

### 3.3 `(admin)` — Control Panel

- **Layout:** Fixed left sidebar (`w-64`) for desktop navigation; hidden inside a `Sheet` on mobile.
- **Header:** Displays the current route breadcrumb and the logged-in administrator avatar (logout dropdown).
- **Content:** Occupies the remaining screen space (`flex-1`). Very light gray background (`bg-zinc-50`) with white cards to highlight data.

### 3.4 `(store)` — Store

- **Layout:** Similar to `(public)`, but includes a cart icon in the header.
- **Visual Focus:** Product images should fully fill their cards (`object-cover`). The purchase CTA button should be the highest-contrast element on the screen.

---

## 4. Component Guidelines (shadcn/ui)

Agents must use components from `@repo/ui` instead of creating native HTML.

- **Buttons (`Button`):**

  - Primary actions: `<Button variant="default">`
  - Secondary actions (cancel, back): `<Button variant="outline">`
  - Destructive actions: `<Button variant="destructive">`
  - Always include `disabled` states and `loading` indicators (`lucide-react` spinner icon) during form submissions.

- **Forms (`Form`, `Input`, `Label`):**

  - Labels should always appear above inputs (vertical stack).
  - Validation error messages (Zod) should appear immediately below the corresponding input using small red text (`text-sm text-destructive`).
  - Optional fields should use the `(opcional)` label suffix instead of asterisks for required fields.

- **Tables (`Table`):**

  - Use for admin panel data and debt listings.
  - On mobile screens, tables that would break the layout should either become horizontally scrollable (`overflow-x-auto`) or be replaced with a list of `<Card>` components.

- **Badges (`Badge`):**

  - Use for displaying system statuses.
  - Positive statuses (Active, Paid): `default` variant with green color.
  - Warning statuses (Pending): custom yellow variant.
  - Inactive statuses (Cancelled, Archived): `secondary` variant (gray).

- **Icons:** Use exclusively the `lucide-react` library.

---

## 5. Behaviors, States, and Interactions

Agents must implement interfaces that account for non-ideal scenarios.

- **Empty States:** When a table or list returns no data, do not leave the screen blank. Display a centered container with a light gray Lucide icon, an explanatory title (e.g. `"Nenhum parceiro encontrado"`), and, if applicable, a button to create the first record.
- **Loading States:** Avoid blank screens. Use the shadcn `<Skeleton>` component to create skeleton screens matching the exact structure of the data being loaded, especially for dashboards and product listings.
- **Action Feedback (Toasts):** Any create, update, or delete action (POST/PATCH/DELETE) must trigger a shadcn `<Toast>` in the bottom-right corner indicating success or displaying the formatted error message returned by the API.

---

## 6. Module-Specific Guidelines (Strict Rules)

Agents must apply the following visual rules to the modules described in `spec.md`:

### 6.1 Digital Membership Card (MEMBER-020)

- **Appearance:** Should simulate a real physical card. Display a large faded club crest in the background (`opacity-10`).
- **QR Code:** The QR code container must always have a fully white background (`bg-white p-4`) regardless of the user's active light/dark theme, ensuring turnstile scanners can reliably read the code through sufficient contrast.
- **Brightness:** Apply `filter: brightness(1.2)` to the body exclusively on this route, according to the business rule.

### 6.2 Transparency Portal (TRANS-011)

- **Charts:** Use the `recharts` library. The debt evolution chart should emphasize the "Valor Restante" line (thicker stroke, brand color), while "Valor Original" lines should appear more faded for historical context.
- **Numeric Typography:** All financial values displayed in dashboards must use Tailwind's `tabular-nums` class to ensure digits remain vertically aligned as values change.

### 6.3 Member Gate in Store (STORE-008)

- **Visual Restriction:** Products marked as `membersOnly: true` displayed to non-members must have their purchase button replaced with a `<Button variant="secondary">` styled with a lock icon (`Lock` from Lucide), displaying the text `"Exclusivo para Sócios"`. Do not hide the product; use it as a conversion tool.
