# AGENTS.md — zbrojni-kviz

The build/test/release contract for this repo. An agent (or the overnight ralph loop) should be
able to read only this file and ship correctly. Keep every command copy-pasteable and current.
Taste rules that apply to every flywheel product live in the hub: `flywheel/docs/standards/taste.md`.

> One-liner: Free, offline practice trainer for the Czech firearms-licence theory exam
> (zkouška odborné způsobilosti pro zbrojní průkaz) — 837 official questions, zákon 90/2024 Sb.
> Stack/template: Vite + React 19 + TS + Tailwind 4 (PWA), Supabase auth/sync  ·  Track: community
> Portfolio record: `flywheel/data/products/zbrojni-kviz.json`

## Build
```bash
npm ci
npm run build   # tsc -b && vite build && node scripts/prerender.mjs (per-okruh SEO pages + sitemap)
```

## Test (TDD required; persona-journey test per primary journey)
```bash
npm run typecheck   # tsc -b --noEmit
npm test            # vitest run
npm run e2e         # playwright test (builds + previews on :4173, writes shots to e2e/shots/)
```
Gate: typecheck · test · build must pass (CI is `.github/workflows/deploy.yml`, shaped after
`docs/standards/ci.template.yml`). Block only on these; e2e also runs in CI on every PR.

## Run / verify a change in the real app
```bash
npm run dev         # Vite dev server (http://localhost:5173)
```
Primary journeys: home → daily lesson (12 q) → completion + streak; practice by okruh; exam
mode (60 q, timer) → results. SEO deep-link: open `/okruh/zakon-o-zbranich/` — the app boots
straight into that okruh's practice.

## Release (the finish line — produces a storefront link)
- **Web** → GitHub Pages at `https://zbrojnikviz.dravec.org` (`public/CNAME`). Deploy is automatic
  on push to `main` via `.github/workflows/deploy.yml`. Platform env for the build:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (repo secrets; no-op locally/in tests).
- Data source: `data/questions.json` (837 Q, MV ČR, zákon 90/2024 Sb.); regenerate via `npm run data`.

## Analytics (Common Platform)
Vendored client: `src/platform/flywheel-client.ts`, wrapped by `src/analytics.ts`. First-party,
cookieless, fire-and-forget into the shared flywheel-core (Supabase). Fires the shared taxonomy
(`app_open`, `start_lesson`/`start_practice`/`start_exam`, `lesson_complete`, `feedback_given`,
`error`). Activation KPI is `lesson_complete` (set in the portfolio record); the feedback card on
the results screen fires `feedback_given`.

## Done means
Green CI · deployed to zbrojnikviz.dravec.org · portfolio record updated (stage/gate/links)
· storefront link live · (outward promotion only after Pavol's sign-off).
