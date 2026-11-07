# Architecture — how zbrojni-kviz works now

Living doc (flywheel `standards/feature-sessions.md`). It describes the code as it is now; a PR
that changes behaviour updates it. The why lives in `docs/PRD.md` and `docs/SIGNATURE.md`.

## Shape

A static single-page app (Vite + React 19 + TypeScript + Tailwind 4, PWA) on GitHub Pages at
https://zbrojnikviz.dravec.org. Everything works offline and without an account. An optional
Supabase sign-in syncs progress. There is no server of our own.

```
data/            questions.json (837 q, MV ČR), meta.json (exam rules), citations.json, cases.json,
                 law/*.json (parsed acts), exam-guide.json; Python/Node generators beside them
src/domain/      pure logic, no React: questions, session, lesson, selection, exam, progress,
                 readiness, difference (near-miss + reading aid), sources, cases, round (resume),
                 storage (localStorage keys), rng
src/app/         reducer store (store.ts) + AppProvider (persistence, cross-tab merge, cloud sync)
src/auth/        Supabase client, AuthContext, sync (fetch → merge → save)
src/components/  QuestionCard, screens (Home, Practice, Quiz, Results, Stats, Study), ui
src/seo/         static page renderers used by scripts/prerender.mjs
src/platform/    vendored flywheel client + event allow-list
e2e/             Playwright persona journeys at 390 px
```

## Data on the learner's device (localStorage)

| key | what | synced |
|---|---|---|
| `zbrojni-kviz:progress:v1` | per-question stats, bookmarks, lesson streak, exam attempts | yes, when signed in (merge per question, last write wins) |
| `zbrojni-kviz:owner` | account the local progress belongs to | no |
| `zbrojni-kviz:rounds:v1` | unfinished lesson and cases, to resume | no |
| `zbrojni-kviz:reading-aid` | "Zvýraznit rozdíly" switch | no |
| `fw:vid` / `fw:sid` (session) | anonymous analytics ids | no |

Every answer is recorded into progress the moment it is given (quiz-rounds standard). The mock
exam keeps answers but records an attempt only when finished or timed out.

## Views

One reducer (`src/app/store.ts`) drives the views: tabs `home | practice | stats | guide` and the
flows `quiz | exam | results`. Boot paths: `/okruh/<slug>/` starts that okruh's practice.

## Build and deploy

`npm run build` = `tsc -b && vite build && node scripts/prerender.mjs`. Prerender writes a static,
crawlable page per okruh, per question (`/otazka/<id>/`), `/zkouska/`, and the sitemap. CI
(`.github/workflows/deploy.yml`) runs typecheck, unit tests, build and e2e on every PR, and deploys
`dist/` to Pages on push to `main`.

## Analytics

`src/analytics.ts` wraps the vendored flywheel client: first-party, cookieless, fire-and-forget
inserts into the shared events table. Automated browsers are dropped. `track()` accepts only the
names in `src/platform/allowed-events.ts`; product detail goes in `key_action` props.

## Shared data

None beyond the optional progress sync. Features that need data across learners must either move
it between devices through the learners themselves (links they share), or get Pavol's OK for a
table or a published file; see `docs/PRD.md` §5.4.
