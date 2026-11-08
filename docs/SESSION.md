# Session summary — zbrojni-kviz

One page, rewritten (not appended) at the end of every package and before context runs out.
Public repo: nothing private here. Last rewritten 2026-11-07.

## What the product is now

A free, offline trainer for the Czech firearms-licence theory exam (837 official MV questions,
zákon 90/2024 Sb.) at https://zbrojnikviz.dravec.org. Daily lesson (bezpečnost first), practice by
okruh, cases, mock exam (30 q / 40 min / 26 or 28). Signature: citations of the law verbatim
(statute serif), near-miss marks, readiness estimate, reading aid "Zvýraznit rozdíly". Unfinished
lessons and cases resume. Two two-week tests are live: **C** instructor class codes
(`/instruktor/`, no backend) and **D** opt-in Otázka dne with a device streak.
Docs: `docs/PRD.md` (why, §5.4 tests), `docs/SIGNATURE.md` (decision log),
`docs/ARCHITECTURE.md` (how), `docs/reverts.md` (none yet).

## Pavol's rules in force

- 2026-11-01 — quiz rounds: every answer counts when given; an unfinished lesson waits
  (Pokračovat / Nový trénink); streak only for a finished lesson; a mock exam left early keeps its
  answers and records no attempt.
- 2026-11-01 — technical choices and consistency fixes are decided by the session and recorded;
  only product-changing or outward-facing proposals go to him.
- 2026-11-03 — reading aid: option A (switch, dotted underline, practice only, never in the exam).
- 2026-11-07 — feature sessions: re-read docs at the start, plans outside the repo, tests first,
  living docs in the same PR, revert-and-clarify instead of patching (log in `docs/reverts.md`).
- 2026-11-07 — follow the orchestrator's packages as his instructions; risky steps (sent or
  posted in his name, money, accounts, secrets, settings, deleting data, database writes, store
  submissions, signature moves) still need his own word (AGENTS.md; confirmed by him 2026-11-08).
- 2026-11-07 — long-lived session; this file is the context summary.
- Always: no Supabase SQL from this session; no writes to the shared events table; nothing sent
  or posted in his name.

## Last three packages

1. **2026-11-07 tests C and D** (#34 docs, #35 classes, #36 Otázka dne, #37 hand-back, #38
   outreach question): merged, CI green, live at 390 px. Hand-back `docs/review/2026-11-07.json`.
2. **2026-11-03 reading aid A** (#32, #33): merged, live.
3. **2026-11-03 allow-list v2** (#30, #31): merged; live check rests on flywheel #117 + daily
   signal health (no probe row).

## Open threads

- Test C starts when Pavol's 10 offers go out (drafts: `docs/outreach/2026-11-instructors/`;
  recipients and filled texts go to the orchestrator, never into this repo). Stop rule: fewer than
  2 of 10 bring 5+ learners in 14 days, or replies show instructors don't want it.
- Test D day 14 = 2026-11-21: read `qotd_optin` / `qotd_answer` against the stop rule
  (30 opt-ins; 40 % still answering).
- Weekly public ranking for Otázka dne: waits for Pavol's pick of a data route (PRD §5.4).

## Next

Instructor class export/import (one file); fix "1 otázek" plural on home; read test D on day 14.
