@AGENTS.md

# CLAUDE.md — Claude Code operating guide (PharmaLink Frontend)

This file imports `AGENTS.md` above (its full contents apply). Below are the operating
rules specific to how **you, Claude Code**, should work in this repo. Read `AGENTS.md`
first for project, roles, design direction, stack, and the backend contract.

---

## Golden rules (in priority order)

1. **The design-engineering skill at `/c/Code/development/design-eng-skills` wins any
   conflict** on UI/UX/frontend craft. When unsure how something should look or behave,
   consult it before deciding (see "Using the design skill" below).
2. **Upwork is the design north star** — a trustworthy, approachable two-sided marketplace
   (patient = client, pharmacy = freelancer). Keep that warmth; keep the skill's rigor.
3. **The mobile team mirrors this frontend.** Treat responsive, tokenized, documented
   layouts as deliverables — the mobile app will look like whatever you ship on mobile web.
4. **One focused task, then stop.** Never auto-commit, never auto-continue, never push
   unless asked.

---

## Using the design skill (it is NOT an installed Claude skill)

It's an external repo, so you cannot invoke it with the Skill tool. Instead, on any UI task:

1. **Audit first:**
   `python /c/Code/development/design-eng-skills/design-engineer/scripts/design_audit.py <app-or-package-path>`
2. **Read** `design-engineer/SKILL.md`, then the reference file(s) that match the task:
   - visuals/tokens/primitives → `references/design-language.md`
   - navigation/forms/tables/states/mobile → `references/interaction-language.md`
   - animation/loaders/icons → `references/motion-and-icons.md`
   - reusable primitive/component APIs → `references/implementation-patterns.md`
3. Apply its **craft + process** (primitives-first, whole-state coverage, a11y, motion
   discipline, browser QA) with **PharmaLink's own tokens** (soft radius, health-green
   accent, Amharic-ready type — see `AGENTS.md` §6). Its square/mono house style is a
   fallback we intentionally override for this consumer-health product.

---

## The loop you must follow

**INSPECT → PLAN → IMPLEMENT (one task) → VERIFY → REPORT → WAIT.**

- **Inspect** the existing repo and the design skill before proposing anything. Do not
  blindly replace the frontend team's existing files or architecture.
- **Plan**: state the task, what it is, and what you'll do. For non-trivial UI, propose
  the approach (and states you'll cover) before writing code.
- **Implement only that one task.** No unrelated refactors, no unrequested features.
- **Verify**, then **Report** in this shape:

  ```
  ## Task Complete
  ### What I changed
  - ...
  ### Verification
  - Build: PASS/FAIL   - Lint: PASS/FAIL   - Browser QA (desktop + mobile): ...
  ### Git
  Commit ready: YES/NO
  Suggested commit: git add <paths> && git commit -m "..."
  ### Next task
  ```
- **Wait** for the human to confirm before committing and before the next task.

## Verification expectations

- Run `npm run lint` and `npm run build` (build includes typecheck). Report both.
- For any visual change, **start the dev server and inspect the edited route(s) in a
  browser at mobile and desktop widths** — check overlap, clipped/!Amharic text, contrast
  in both languages, overflow, focus-visible, empty/loading/error states, and console
  errors. If you cannot run a browser, say so explicitly rather than claiming visual QA.
- Prefer verifying the real thing over asserting it works.

## Git discipline

- This repo's `origin` is the frontend team's GitHub (`PharmaLINK-web`), currently empty.
- **Never commit or push without explicit confirmation.** When a task is done, stage the
  intended files, then **show the exact files that would be committed** and the suggested
  message, and wait.
- Keep the Next.js-managed block in `AGENTS.md` (`next dev` re-adds it); commit it with
  your work so the tree stays clean.
- Never stage `node_modules`, `.next`, or real `.env*` files (only `.env.example`).

## Scope reminder

The current phase is **project initialization only**. Do **not** build signup, signin,
OTP, dashboards, or other features yet. When we move to auth, we will first inspect the
real backend API (`/c/Code/development/PharmaLINK-backend`) and build against it.
