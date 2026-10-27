# Founder cases — real situations with known answers

Every sweep and release candidate checks these. Drafted 2026-10-21 from the repo's history; none is confirmed yet. A row becomes binding (and gets a CI check) when Pavol marks it confirmed. A case changes only with a written reason.

| # | Situation | Known right answer | Source | Confirmed |
|---|---|---|---|---|
| 1 | Fetch the live JS bundle linked from https://zbrojnikviz.dravec.org/ after any deploy. | It contains a `https://…supabase.co` URL. From c584edd (2026-07-03) to PR #7 (2026-10-21) it did not (`index-COEzdW11.js`): sign-in, sync and all analytics were dead. From Pavol's notes, unverified: the PMO scan saw 0 visitors after 2026-07-09, and the check passed on 2026-10-21 (`index-Dnzs3h95.js`). | PR #7 finding 1 / commit 31598e7; flywheel docs/research/pmo-2026-10-17 | no |
| 2 | CI e2e runs the Supabase-configured build in Playwright (`navigator.webdriver` true). | No analytics events (`app_open`, `start_*`, `lesson_complete`) are sent, so CI never adds to the KPIs. | PR #7 finding 1b / commit 2d42fa2 | no |
| 3 | Start a mock exam (Zkouška). | 30 questions: 17 legal, 5 Nauka, 5 safe handling (q562–596, q784–799), 3 Zdravotnické minimum. 40-minute limit. Pass at 26/30; 28/30 for rozšířené zbrojní oprávnění; 25 is a fail. (Until Oct 2026 this row said 60 q / 80 min / 57, which is the examiner's exam in § 34, not the applicant's.) | zákon 90/2024 Sb. § 20 odst. 3 písm. a); NV 238/2025 Sb. § 12 odst. 2; data/meta.json `exam` | no |
| 4 | Look up question 717, and count the question pool. | q717's correct answer is B (the legacy jsx had A). The pool has 837 questions, q108 included. | data/README.md reconciliation table; commit c980d12 | no |
| 5 | Build many mock exams and daily lessons with different seeds. | None contains both copies of a duplicate pair: q523/q529 or q587/q590. | PR #7 findings 8 and 22 / commits 7c369bd, bfbd65a; data/meta.json `duplicatePairs` | no |
| 6 | Device A has a 40-day streak with last lesson 14 Oct; device B has a 1-day streak on 15 Oct. Progress merges. | 41-day streak dated 15 Oct (the old code kept 40 @ 14 Oct, and a lesson on 16 Oct then reset it to 1). | PR #5 "Changed while consolidating" / commit 9f6d356 | no |
| 7 | A mock exam runs out of time with questions unanswered. | Unanswered questions count as wrong, are listed on the results screen, and go into the review queue. | PR #7 finding 9 / commit e56959f | no |
| 8 | Remove a bookmark on one device, then sync with a device that still has it. | The bookmark stays removed (the last toggle per bookmark wins). | PR #7 finding 5 / commit 313036f | no |
| 9 | Account A answers questions, signs out, the page reloads (OAuth or magic link), account B signs in in the same browser. | B's progress and cloud row hold none of A's answers. | PR #7 finding 3 / commit ebc1d37; PR #5 commit 808e2f2 | no |
| 10 | Finish a mock exam, then reload the app. | The attempt is still listed under Zkoušky on Stats, newest first; history keeps at most 50 attempts. | PR #1 / commit 43a6d91; src/domain/progress.ts `MAX_EXAM_ATTEMPTS` | no |

Left out on purpose: the home-screen streak showing 0 until the day's lesson (PR #5 left that as an open decision for Pavol), and the 2026-10-10 report that another app's sign-in email came branded "zbrojni kviz" (a fleet auth issue, not this repo).
