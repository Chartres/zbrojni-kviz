# Zbrojní oprávnění — practice trainer

**Live:** https://zbrojnikviz.dravec.org

A free, beautiful, self-paced trainer for the Czech firearms-licence theory exam
(*zkouška odborné způsobilosti pro zbrojní oprávnění*, Act 90/2024 Sb., valid from 2026).
All **837 official questions** and their images, practised the way the exam is actually
won: by drilling the real wording and learning from mistakes.

> ~90 % of exam failures are the theory test. This app makes practising it effortless.

## Highlights

- **Authoritative data.** Questions are extracted directly from the official Ministerstvo vnitra
  PDF, not a third-party copy — including repairing the PDF's font corruption and detecting the
  correct answer from its highlight marker. Reconciliation against the source even **fixed a wrong
  answer key** and a **missing question** in the legacy data. See [`data/README.md`](data/README.md).
- **Montessori learning design.** Practice mode gives immediate, calm *control-of-error* feedback;
  progress is tracked as **mastery** (not grades); missed questions resurface via lightweight
  **spaced repetition** — drill exactly your weak spots. See [`docs/PRD.md`](docs/PRD.md).
- **Real exam simulation.** 60 questions in the official composition (52 legal + 5 weapons-science
  + 3 first-aid), 80-minute timer, pass at 57/60, per-category breakdown.
- **Profiles & sync (optional).** Sign in with Google or a magic-link email to sync progress across
  devices — offline-first, with conflict-free merge. Works fully without an account too.
- **"Metal, not aggression" design.** Refined gunmetal & brushed steel with a restrained brass
  accent — serious and precise, never tactical.
- **Free hosting.** Static site on GitHub Pages; free-tier Supabase for auth/sync.

## Tech & engineering

- **React 19 + TypeScript + Vite 8**, **Tailwind v4** design tokens.
- **Test-driven** throughout (red → green): **Vitest** + React Testing Library for the pure domain
  and components, **Playwright** for end-to-end journeys. ~80 unit/component tests + E2E, all green
  in CI before every deploy.
- Pure, framework-free **domain layer** (`src/domain`): seeded RNG, quiz session, exam rules,
  mastery/spaced-repetition progress store, versioned storage, search/selection.
- **CI/CD:** GitHub Actions runs typecheck + tests + build, then deploys to Pages.

## Develop

```bash
npm install
npm run dev          # local dev server
npm test             # unit/component tests (watch: npm run test:watch)
npm run e2e          # Playwright end-to-end
npm run build        # production build
npm run data         # regenerate questions.json from the official PDF (needs the Python venv)
```

Enabling sign-in/sync is optional — see [`docs/SUPABASE.md`](docs/SUPABASE.md).

## Project layout

```
data/            official PDF, extractor (extract.py), questions.json + meta.json
src/domain/      pure logic: rng, session, exam, progress, storage, selection, questions
src/app/         reducer store + context (offline-first persistence + cloud sync)
src/auth/        Supabase client, sync, auth context (env-gated)
src/components/  QuestionCard, screens (menu/quiz/results/stats/study), AuthPanel
e2e/             Playwright journeys
legacy/          the original single-file quiz, archived
docs/            PRD (design thinking / Montessori) + Supabase setup
```

Questions © Ministerstvo vnitra ČR. This is an unofficial study aid.
