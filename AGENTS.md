# PharmaLink Frontend — Agent Guide

You are working on the **PharmaLink web frontend**: a mobile-first, responsive Next.js
app (App Router + TypeScript + Tailwind). This document is the canonical guide for the
frontend. Read it fully before designing or coding.

---

## 0. Precedence (read this first)

1. **The design-engineering skill at `/c/Code/development/design-eng-skills` is the
   authority on all UI/UX/frontend craft.** When anything in this file conflicts with
   that skill, **the design skill wins.** See §4.
2. This `AGENTS.md` governs project scope, product context, stack, and workflow.
3. `CLAUDE.md` imports this file and adds Claude Code operating notes.

If a rule here and a rule in the design skill disagree on *how* something should look or
behave, follow the design skill and note the deviation in your report.

---

## 1. What PharmaLink is

PharmaLink is a **medicine availability & pharmacy companion for Ethiopia**. It turns a
fragmented, phone-call-driven medicine search into a searchable, connected network.

**The core loop (prove this above all else):** a patient searches for a medicine → sees
which nearby pharmacies have it in stock and at what price → can read plain-language,
Amharic-available safety information about it. Pharmacies keep stock and prices current
through a low-friction dashboard.

This is an **MVP**. Build the smallest complete version of each surface. Deferred
(do NOT build unless asked): online payments/delivery, POS/inventory integrations,
e-prescriptions, exhaustive drug-interaction engines, native apps, multi-city/multi-language
beyond Amharic/English.

Context that shapes every design decision:
- **Intermittent 3G/4G, low-end Android.** Mobile-first, list-first, cache-aware, small
  bundles. Core search should feel usable in < 5s on a median Ethiopian connection.
- **Amharic + English** on all core patient screens, with a persistent language toggle.
  Safety content is authored/reviewed in both languages — never machine-translated on the fly.
- **Health-adjacent, safety-sensitive.** Drug info always carries a visible disclaimer;
  what a patient searches for is sensitive and never exposed to pharmacies beyond aggregate
  demand signals.

---

## 2. Roles — a two-sided marketplace (think Upwork)

PharmaLink has three roles. The product shape is a **two-sided marketplace**, and our
design north star is **Upwork** (see §5):

| PharmaLink role | Upwork analogue | What they do |
|---|---|---|
| **user** (patient/caregiver) | client | Search medicines, compare pharmacies by price/distance, read drug info, set refill reminders |
| **pharmacist** (pharmacy staff/owner) | freelancer | Manage stock & prices, bulk CSV upload, see demand-signal analytics |
| **admin** | platform operator | Onboard/verify pharmacies, review & approve pharmacist applications, moderate drug-info content |

The **user** and **pharmacist** experiences are two distinct product surfaces that share
one design system — exactly like Upwork's client vs. freelancer sides. Design them as
peers, not as an app with a bolted-on "seller mode."

Personas to design for: **Selamawit** (32, price-sensitive, manages a parent's meds,
prefers Amharic), **Tesfaye** (58, low tech comfort, needs large simple UI), **Meron**
(pharmacy counter staff, seconds between customers), **Dr. Aberash** (owner, wants zero
admin burden).

---

## 3. Product surfaces (MVP)

**Patient (user) side**
- **Medicine search** — type-ahead by brand/generic, Amharic-aware, typo-tolerant. The
  primary entry point of the whole product.
- **Results + pharmacy locator** — ranked list (default) + map; stock status
  (in / low / out), distance, price, and a prominent **"last updated"** freshness signal.
- **Price comparison** — pharmacies for one medicine sorted by price with distance
  alongside; ETB formatting; "Price not listed" shown, never hidden.
- **Drug info page** — plain-language indication, dosage ranges, side effects, curated
  high-risk interaction flags; mandatory visible medical disclaimer.
- **Refill reminders** — date/interval based; push or SMS; snooze/edit/cancel.

**Pharmacy (pharmacist) side**
- **Dashboard** — medicine list with 2-tap stock toggles (in/low/out) and 2-tap price
  edits (no full reload), CSV bulk upload with per-row validation, and demand-signal
  analytics (views, searched-but-unstocked).

**Admin side**
- **Onboarding/verification** of pharmacies; **content review queue** for GenAI-drafted
  drug info (approve/reject before public); pharmacist-application review (approve/reject).

---

## 4. Design authority: the design-engineering skill

`/c/Code/development/design-eng-skills/design-engineer/` is the **source of truth for
frontend craft**. Use it on every UI task. It is an external repo (not an installed
skill), so read its files directly.

**Always:**
1. Run the audit before proposing visuals:
   `python /c/Code/development/design-eng-skills/design-engineer/scripts/design_audit.py <path>`
2. Read `SKILL.md`, then the reference(s) relevant to the task:
   - `references/design-language.md` — visual language, primitive style contract, tokens, quality bar.
   - `references/interaction-language.md` — navigation, search/command, forms, tables, states, dialogs, mobile.
   - `references/motion-and-icons.md` — motion vocabulary, timing defaults, loaders, icon policy (lucide default).
   - `references/implementation-patterns.md` — button/card/command/table/widget patterns, package stack.

**The skill's non-negotiable craft rules (apply to everything we build):**
- **Primitives first.** Build reusable `Button`, `Input`, `Card`, `Dialog`, `Table`,
  `Badge`, `Command/Search` with small composable APIs (`cn`, CVA variants, `forwardRef`,
  native props). No one-off page markup for repeated things. No card-in-card.
- **Design the whole state, not the happy path** — loading/skeleton, empty (with a next
  action), error (with retry), success, plus hover/focus-visible/pressed/disabled/selected
  and active-route. This is a hard requirement (§11).
- **Accessibility is baseline** — semantic HTML, keyboard flows matching pointer flows,
  visible `focus-visible`, accessible names, status text (never color alone).
- **Motion with purpose** — use the skill's timing defaults; respect
  `prefers-reduced-motion`; never animate to hide latency.
- **Verify like a designer-engineer** — run typecheck/lint/build, then inspect edited
  routes in a browser at **desktop and mobile** widths for overlap, clipping, contrast,
  overflow, blank canvases, and console errors.

The skill's default *house style* is square/mono/dev-tool. That is a **fallback for repos
with no design system.** PharmaLink has its own consumer-marketplace direction (§5–§6) —
so we follow the skill's **craft and process** while using **our** visual tokens. Where
genuinely ambiguous, defer to the skill.

---

## 5. Design direction: Upwork-inspired marketplace

Motivate the UI with **Upwork**: a trustworthy, approachable, information-rich two-sided
marketplace — not a dev-tool console. Translate Upwork's patterns into PharmaLink:

- **Search-first home.** Like Upwork's talent/job search, the patient home leads with a
  big, confident search field and smart suggestions. Everything flows from search.
- **Listing cards.** Pharmacy/medicine results read like Upwork's talent/job cards:
  scannable rows with the essentials — pharmacy name, **stock badge**, **price (ETB)**,
  **distance**, **"updated Xh ago"**, and a clear primary action (Directions / Call / View).
- **Comparison surface.** Price comparison mirrors Upwork's proposal/candidate compare:
  a calm, sortable table optimized for a quick decision (price vs. distance vs. freshness).
- **Two role homes, one system.** A patient dashboard and a pharmacy dashboard, each
  purpose-built (Upwork client vs. freelancer), sharing tokens, primitives, and nav shell.
- **Supply-side dashboard.** The pharmacy dashboard is the "freelancer workspace": manage
  listings fast, see demand analytics, trust/verification status — low friction, high signal.
- **Trust & verification cues.** Verified-pharmacy badges, freshness timestamps, ratings/
  distance — the marketplace-trust vocabulary Upwork leans on, applied to pharmacy stock.
- **Onboarding flows** with clear progress, like Upwork's freelancer onboarding, for
  pharmacy application/verification.

Tone: **friendly, calm, trustworthy, and legible** for low-tech users and stressful
(urgent-medicine) moments — closer to Upwork/consumer health than to a terminal UI.
Keep the marketplace warmth, but keep the skill's rigor on states, a11y, and primitives.

---

## 6. Visual system (project tokens)

Encode these as Tailwind theme tokens / CSS variables in `app/globals.css` before
scattering raw values. This is the PharmaLink direction; align new primitives to it.

- **Canvas:** light-first, clean neutral background; dark mode is a follow-up, not MVP.
- **Palette:** trustworthy health/marketplace **green** as the primary accent (works for
  both "pharmacy/health" and the Upwork-green marketplace feel), on a near-neutral gray
  scale. Restrained accent use — green for primary actions, focus, and positive stock.
- **Semantic state colors:** in-stock = green, low = amber, out = red/neutral; plus
  success/warning/danger/info. Always pair color with **text** (accessibility + Tesfaye).
- **Radius:** **soft, consumer-friendly** (`rounded-md`/`rounded-lg`, pill for chips/
  badges) — this is a deliberate, permitted deviation from the skill's square default,
  because the product is consumer health, not a dev tool.
- **Type:** clean sans for everything; larger base size and generous line-height for
  readability and low-tech users; reserve mono only for IDs/timestamps/codes if useful.
  Amharic and Latin must both render well — verify Amharic glyphs at every size.
- **Spacing & density:** comfortable, touch-safe (min 44px targets) on mobile; denser on
  the pharmacy dashboard where staff scan many rows.
- **Elevation:** subtle, not heavy floating stacks; 1px borders/separators for structure.
- **Motion:** skill timing defaults (hover 120–180ms, dialog 180–280ms, page 240–450ms),
  `prefers-reduced-motion` honored.

---

## 7. Stack & conventions

- **Next.js (App Router)** — this is a recent major (see the managed Next block at the
  bottom of this file). **Read `node_modules/next/dist/docs/` before using unfamiliar
  Next APIs**; do not assume older conventions.
- **TypeScript**, **Tailwind CSS**, **ESLint** (all already configured). Import alias `@/*`.
  Project lives **flat** at the repo root (`app/` — no `src/`).
- **Server Components by default;** add `"use client"` only where interactivity requires it
  (search box, toggles, forms, map). Keep client bundles small (low-bandwidth users).
- **Icons:** `lucide-react` is the default (install when first needed); one size/stroke per
  toolbar or row. Follow the skill's icon policy.
- **Component libraries:** prefer building shadcn/Radix-style primitives with `cn` +
  `class-variance-authority` when we introduce them; don't hand-roll ad-hoc styles for
  reusable pieces. Compose from existing primitives before adding new ones.
- **Package manager:** npm (lockfile committed).
- **Scripts:** `npm run dev`, `npm run build`, `npm run lint`.

---

## 8. Accessibility, localization, and performance (Ethiopia constraints)

- **Mobile-first, list-first.** The list view is always the default and works without map
  or location permission. Layouts must **reflow**, not merely shrink.
- **Amharic + English** on all core patient screens; persistent language toggle; never
  clip Amharic text; verify both languages at every breakpoint.
- **Low bandwidth:** aggressive caching of catalog/drug-info; graceful degradation showing
  last-known data with a clear "may be outdated" indicator; minimal images/assets.
- **A11y:** WCAG-minded contrast in both languages, keyboard support, `focus-visible`,
  large touch targets, screen-reader labels. Assume low-tech users under stress.

---

## 9. The mobile team depends on this frontend (design source of truth)

A separate **mobile team** mirrors this web frontend to build the mobile app. **This
responsive web app is their design reference.** Therefore:

- Keep **design tokens, component specs, breakpoints, and responsive behavior clean and
  legible** — they will be copied.
- Prefer documented, named tokens and reusable primitives over one-off inline styles, so
  the mobile team can map them 1:1.
- When you finalize a screen, make sure its **mobile layout is the canonical intended
  design**, not an afterthought — the mobile app will look like whatever the mobile web does.
- Note responsive intent (breakpoints, what collapses/stacks) near the component when
  non-obvious.

---

## 10. Backend API (source of truth)

The backend auth system is **already built and is the source of truth** for integration.
Note: the PRD's suggested backend stack (NestJS/Supabase/Prisma) is **superseded** — the
real backend is **Go + Gin + MongoDB + Redis** at `/c/Code/development/PharmaLINK-backend`.
The frontend integrates over its HTTP API.

Known contract (detailed typed-client wiring is a **later task** — do not build auth
screens yet):
- **Base URL:** `process.env.NEXT_PUBLIC_API_URL` (local `http://localhost:8080`). Routes
  are at the **root** (no `/api/v1` prefix), e.g. `/auth/login`.
- **Roles:** `user`, `pharmacist`, `admin`.
- **Auth:** sign-up is **Email + Password + OTP** (`POST /auth/register` → 202, then
  `POST /auth/verify-otp` → tokens); sign-in is **Email + Password only** (`/auth/login`).
  Pharmacist onboarding: `POST /auth/pharmacist/apply` → OTP → pending → admin approves.
  `GET /auth/me` returns role/status/pending-application (for role-aware UI + banners).
- **Tokens:** JWT **access + refresh**. Send `Authorization: Bearer <access_token>`.
- **Success envelope:** `{ "success": true, "message": "...", "data": {...} }`.
- **Error envelope:** `{ "error": { "code": "SOME_CODE", "message": "..." } }` — map
  `code` to user-facing (and localized) messages.

---

## 11. Design the whole state (hard requirement)

No screen is "done" on the happy path alone. For every surface cover:
loading/skeleton · empty (with a useful next action) · error (with retry/recovery) ·
success/confirmation · unauthorized/denied · and control states
(hover/focus-visible/pressed/disabled/selected/active-route) · plus mobile nav, long text,
overflow, and touch targets. See `references/interaction-language.md`.

---

## 12. Working workflow

Work with the human **one focused task at a time**:

**INSPECT → PLAN → IMPLEMENT (one task) → VERIFY → REPORT → WAIT FOR CONFIRMATION → NEXT**

- **Inspect** the existing repo/component and the design skill before proposing visuals.
  Never blindly replace the frontend team's existing files or architecture.
- **Implement only the one task.** Don't refactor unrelated files or add unrequested features.
- **Verify:** `npm run lint` + `npm run build` (and typecheck), then **browser QA at
  desktop and mobile widths**. Report Build/Lint PASS/FAIL and what you visually checked.
- **Report** what changed, verification results, and the exact suggested commit.
- **WAIT** for confirmation before committing and before the next task. **Never commit
  automatically.** Do not push without being asked.

---

## 13. Coding style

- Write like an experienced product engineer, not an AI. Simple, clear, readable names
  (`user`, `pharmacy`, `listing`, `results`). Short components. No over-engineering, no
  unnecessary abstractions, no single-use utilities.
- Comment only genuinely non-obvious things (a business rule, a tricky responsive/RSC
  boundary, an a11y workaround). Don't comment obvious code.
- Reuse primitives and tokens; don't make every file look artificially identical.

---

## 14. Definition of done (quality bar)

A finished pass should: make the main user workflow clearer; cover at least the
loading/empty/error states; maintain/improve accessibility and keyboard behavior; keep
responsive layouts stable (no overlap, no clipped Amharic, no layout shift); pass lint +
build; and be **visually verified in a browser at mobile and desktop**.

---

## 15. Never do

- Never let this file override the design skill on craft decisions.
- Never build the whole app at once; never continue to the next task without confirmation.
- Never commit or push automatically, or make fake/meaningless commits.
- Never commit secrets (`.env*` except `.env.example`), `node_modules`, or `.next`.
- Never ship a screen without its non-happy states or without mobile verification.
- Never machine-translate safety/drug content on the fly.
- Never change unrelated code or hide errors.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
