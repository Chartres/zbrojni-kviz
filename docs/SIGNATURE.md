# Zbrojní kvíz — signature

What makes this trainer different from every other quiz on the same 837 questions, and where
each difference comes from. Written 2026-10-27 for the deep round
(`flywheel/docs/program/2026-10-27-deep-round.md`); competitors are in
`docs/research/competition-2026-10.md`.

The subject sets the tone. A firearms licence is a matter of law and of safety, and the exam
tests whether a person knows both. The trainer should feel like a well-made legal handbook with
a patient instructor beside it, not like a game.

## 1. Lineage

**Erasmus and the humanists — *ad fontes***. Erasmus, *Novum Instrumentum omne* (1516): back to
the source text instead of the gloss. https://en.wikipedia.org/wiki/Ad_fontes
`changes:` every law question shows the provision it tests, quoted verbatim from zákon
č. 90/2024 Sb. and linked to the consolidated text. A citation is shown only when matching is
confident and blind-validated (`data/README.md` § Citations). We don't paraphrase the law; we
show it.

**Maria Montessori — control of error**. *The Montessori Method* (1912), ch. on didactic
material: the material itself shows the child the mistake, so correction does not depend on
the teacher's verdict. https://www.gutenberg.org/ebooks/29635
`changes:` when the chosen wrong option is almost the right one (a quarter of the bank has such
distractors), the words that differ are struck in the chosen option and marked in the correct
one. The error points at its own correction.

**Benjamin Bloom — mastery learning**. "Learning for Mastery" (1968), *Evaluation Comment* 1(2);
"The 2 Sigma Problem" (1984), *Educational Researcher* 13(6).
https://doi.org/10.3102/0013189X013006004
`changes:` progress is mastery per question and per part of the exam, not points. The readiness
view estimates the chance of passing the 30-question test at 26 and at 28 from what the learner
has actually mastered in each of the four parts, so they know which part to work on.

**J. A. Comenius — from the known to the unknown, the picture with the word**. *Didactica Magna*
(1657), *Orbis Pictus* (1658). https://en.wikipedia.org/wiki/Orbis_Pictus
`changes:` the 71 picture questions (cartridges, parts of a pistol, proof marks) are grouped
with the study-guide figures so the thing is seen with its name. A new learner starts from what
any careful person already knows (safe handling, first aid) before the dense licensing law.

**The safety canon of firearms training**. Jeff Cooper's four rules (all guns are always loaded;
never point at anything you are not willing to destroy; finger off the trigger until on target;
be sure of your target and what is beyond it), codified in the 1980s and taught by ranges
worldwide. https://en.wikipedia.org/wiki/Jeff_Cooper#Firearms_safety
`changes:` the five "safe handling" questions of the real test (NV 238/2025 § 12 odst. 2
písm. c) are drawn from the exam-handling rules and safety principles of the MV bank. The
trainer treats that part as the foundation the rest stands on, not as one okruh among five.

**C. C. Langdell — the case method**. Harvard Law School from 1870; *A Selection of Cases on
the Law of Contracts* (1871). https://en.wikipedia.org/wiki/Case_method
`changes:` (proposed) questions that turn on a situation (nutná obrana, carrying in public, a
minor at the range) are grouped as cases: the situation first, then the rule that decides it,
then the provision.

Underneath all of them: Roediger & Karpicke (2006), the testing effect, and Ebbinghaus (1885),
spacing. The daily lesson and the review queue already rest on these.

## 2. Refused

- **Toy gamification.** No confetti, mascots, badges, cartoon emoji or sound effects. A weapons
  licence is not a game, and the people who take it are adults.
- **Streak anxiety.** The streak counts days; it never nags, never threatens to "break", and
  there are no push notifications.
- **Dark patterns.** No paywall that appears mid-study, no fake scarcity, no "only 3 questions
  left", no account wall. Sign-in exists only to sync.
- **The generic AI-app look.** No purple gradients, blobs, rounded-everything or ✨.
- **Answers without reasons.** We don't show a bare green tick when we can show the provision.
- **Claims we can't back.** No "100 % úspěšnost", no invented pass rates, no citation that the
  matcher was not confident about.

## 3. Signature mechanics

| Mechanic | What the learner sees | From | Status | How we'll know it works |
|---|---|---|---|---|
| **Ze zákona** (ad fontes) | After answering a law question: "Ze zákona · § 83 odst. 2 písm. c)" with the provision verbatim and a link to the full text | Erasmus | shipped (PR #11), 290/561 law questions | `key_action {kind:'source_open'}` rate per answered cited question; on cited vs uncited questions answered wrong, accuracy on the next attempt. Target: cited ≥ uncited + 10 pp |
| **Kontrola chyby** (control of error) | On a near-miss wrong answer, the differing words struck in the chosen option and marked in the correct one; "odpovědi se liší ve vyznačeném" | Montessori | shipped (PR #11), 208 questions | Next-attempt accuracy on questions first missed as a near miss vs other misses. Target: ≥ 70 % |
| **Připravenost** (mastery readiness) | On Stats: estimated chance of passing at 26/30 and at 28/30, and which of the four parts holds it back | Bloom | building | Learners who see it and then pass a mock exam; correlation of the estimate with mock-exam results (calibration within ±10 pp) |
| **Bezpečnost first** | New learners' first lessons lean on safe handling and first aid; the safe-handling part leads the results breakdown | Cooper's rules, Comenius | proposed | Day-7 return of new learners (lesson_complete on ≥ 2 days) |

The engine-level parts (`src/domain/difference.ts`, `src/domain/sources.ts`,
`data/law.py`, `data/cite.py`) are bank-agnostic, so autoskola-kviz and the other quiz
trainers can port them: any bank whose answers restate a published act gets the same
citations.

## 4. Visual signature

The printed statute. The Sbírka zákonů and its commentaries have a recognisable page: § signs,
odstavec numbers in parentheses, písmena, a narrow column, dense black text and nothing
decorative. The trainer keeps its existing "metal, not aggression" palette (gunmetal, brushed
steel, brass) for the app shell. When the law speaks, it looks like the law: the source note
uses the statute's own numbering, set off by a brass rule, so the learner can tell the app's
voice from the act's. Next step (proposed): the quoted provision in a book serif (IBM Plex
Serif, same family as the UI) so a citation reads as a printed excerpt.

Accessibility and the phone contract (`flywheel/docs/standards/mobile-ux.md`) don't regress.
The diff marks are hidden from screen readers, which get the plain sentence plus "liší se: …".

## 5. Founder lens

- **II (the order).** The product must not cost Pavol's evenings. It runs on GitHub Pages and
  free Supabase; the bank is verified by script and re-checked when MV changes the file. For
  learners: a 12-question daily lesson, no notifications, nothing that pulls them back
  against their will.
- **VI (the moat is distribution, reputation, frozen judgment).** The reputation to build is
  "the trainer that is right and shows why": the current file, the legal format, every
  citation verbatim. Distribution is per-question pages that crawlers and AI assistants can
  read without JavaScript. Nothing counts as finished until it reaches applicants.
- **VIII (never lie, cheat or trick).** We fixed our own wrong exam format the day we found
  it and said so in the data README. Citations are shown only when validated. The app says it
  is a study aid, not the exam, and not an official MV product.

Differentiation that follows: competitors sell access to the same 837 questions. We teach from
the source and show the learner where the mistake is.
