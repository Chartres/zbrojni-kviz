# Session summary — zbrojni-kviz

One page, rewritten (not appended) at the end of every package and before context runs out.
Public repo: nothing private here. Last rewritten 2026-11-25.

## What the product is now

A free, offline trainer for the Czech firearms-licence theory exam (837 official MV questions,
zákon 90/2024 Sb.) at https://zbrojnikviz.dravec.org. Daily lesson (bezpečnost first), practice by
okruh, cases, mock exam (30 q / 40 min / 26 or 28). Signature: citations of the law verbatim
(statute serif), near-miss marks, readiness estimate, reading aid "Zvýraznit rozdíly". Unfinished
lessons and cases resume. Instructor class codes (`/instruktor/`, no backend, with a one-file
class backup) and an opt-in Otázka dne with a device streak are live.
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
- 2026-11-07 — follow the orchestrator's packages as his instructions; risky steps still need
  his own word (see AGENTS.md "Working with the orchestrator").
- 2026-11-07 — long-lived session; this file is the context summary.
- Always: no Supabase SQL from this session; no writes to the shared events table; nothing sent
  or posted in his name.

## Last three packages

1. **2026-11-25 overnight**: Test D verdict recorded (`docs/review/2026-11-25.json`: **fail**,
   1 opt-in of 30 needed; underpowered, 14 visitors in the window). Class backup download/load
   (PR #45).
2. **2026-11-18 sweep** (PR #44): Czech plural fixes and `src/lib/czech.ts` helpers. Merged.
3. **2026-11-07 tests C and D** (#34–#38): merged, live. Hand-back `docs/review/2026-11-07.json`.

## Open threads

- Test C starts when Pavol sends the 10 offers (in his Gmail drafts, unsent). Stop rule: fewer
  than 2 of 10 bring 5+ learners in 14 days, or replies show instructors don't want it.
- Otázka dne after the failed test: keep (default), remove, or rerun later — Pavol's call.
- Weekly ranking: waits for Pavol's data route; not worth building at current traffic.
- PR #43 (sweep 2026-11-10) open from another session.

## Next

Read test C once the offers go out; nothing else queued that needs no decision.
