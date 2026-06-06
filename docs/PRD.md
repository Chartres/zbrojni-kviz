# Zbrojní oprávnění — Practice Trainer
### Product Requirements Document

> A free, beautiful, self-paced trainer for the Czech firearms-licence theory exam.
> Built so that practising the real questions — the thing that actually determines
> pass/fail — becomes effortless and even pleasant.

---

## 1. Why this exists (the problem)

To obtain a Czech firearms licence (*zbrojní oprávnění*, the new regime under Act **90/2024 Sb.**,
effective 2026-01-01) an applicant must pass a **theoretical test** before they ever touch a weapon
for the practical part.

**~90 % of exam failures are failures of the theory test, not the shooting.** The questions are
public and finite (837 of them), the answers are known, and the failure mode is almost entirely
*"didn't practise enough with the real wording"*. The official material is a 219-page PDF — accurate
but inert: you cannot practise against it, track what you've mastered, or revisit your mistakes.

**Opportunity:** turn the static official set into a living practice loop. The content is a commodity;
the *practice experience* is the product.

### Design-thinking framing

| Stage | Insight |
|---|---|
| **Empathise** | Candidates are anxious about a high-stakes, dry, legalistic test. They study in fragments (commute, evening). They fear the *wording traps*, not the concepts. |
| **Define** | "I need to practise the actual questions, know which ones I still get wrong, and feel I'm making measurable progress — without paying or installing anything." |
| **Ideate** | Self-paced practice · mistake-driven review · exam simulation matching the real rules · mastery tracking · a calm, confidence-building interface. |
| **Prototype** | Legacy single-file quiz (preserved as the functional baseline). |
| **Test** | The author d-foods it for their own exam prep (primary user = builder). |

---

## 2. Lean / startup canvas

| Block | Content |
|---|---|
| **Problem** | Theory test is the real filter (~90 % of failures). Official material can't be practised against. Existing prep sites are ad-heavy, ugly, or paywalled. |
| **Customer segments** | Primary: **self-studying licence applicants** (CZ). The author, first. Secondary: instructors/ranges pointing students somewhere free. Tertiary: portfolio reviewers / hiring managers. |
| **Unique value proposition** | *"Practise the exact official 2026 questions — beautifully, free, with no login required — and watch your weak spots disappear."* |
| **Solution** | Web app over the authoritative question set: practice & exam modes, mistake review, mastery + spaced repetition, optional cloud profile. |
| **Channels** | GitHub Pages (free static host), shareable URL, SEO on Czech exam terms, the author's portfolio. |
| **Revenue** | None (free). Indirect: portfolio/credibility value. |
| **Cost structure** | $0 hosting (Pages) + free-tier Supabase. Maintenance = keeping the question set current with the law. |
| **Key metrics** | Questions practised/session · % mastered · exam-sim pass rate trend · return rate (D1/D7). |
| **Unfair advantage** | Data fidelity (reconciled against the official source, answer keys verified) + craft (an interface people *want* to study in). |

---

## 3. Users & journeys

### Personas
- **Petr, 34 — the applicant (primary).** Wants the licence for sport/home defence. 30 min/evening.
  Goal: *pass first try*. Fear: the legal-wording questions. Needs progress he can feel.
- **Lucie, 41 — returning candidate.** Failed once on theory. Needs to drill *her* mistakes, not
  start from zero each time. Motivation is fragile — punishment-free practice matters.
- **The reviewer.** Lands from a portfolio. Judges craft, accessibility, and engineering in 90 seconds.

### Core journey — "practise tonight" (no account)
1. Open the site → immediately see categories and a single, obvious **Start practising**.
2. Answer a question → **instant, non-judgemental feedback**: right answer revealed, brief context,
   move on at your own pace.
3. Progress (score, answered, mastery) **persists locally** with zero setup.
4. Leave and return days later → state is exactly as left; **"Review my mistakes"** is one tap.

### Journey — "simulate the real exam"
1. Choose **Exam mode** → 60 questions assembled to the real composition (52 legal / 5 nauka /
   3 health), 80-minute timer.
2. Answer without feedback (like the real thing) → at the end: **pass/fail at ≥57/60**, per-category
   breakdown, and every miss queued into review.

### Journey — "keep progress across devices" (optional account)
1. Tap **Sign in** → Google **or** a magic-link email (one-time token, no password).
2. Local progress **merges** into the cloud profile; thereafter score/answered/mastery sync across
   devices. Signing out keeps working offline.

---

## 4. Learning methodology — Montessori, applied

The pedagogy is deliberate, not decoration. Four Montessori principles map directly to features:

1. **Control of error (self-correcting material).** The learner discovers correctness from the
   material itself — the correct answer and a short *why* appear immediately, so a mistake becomes a
   teaching moment rather than a verdict. No streak-shaming, no punitive scoring during practice.
2. **Self-direction & freedom within structure.** The learner chooses category, mode, and pace.
   The structure (the official curriculum, the exam rules) is the "prepared environment"; within it,
   exploration is free. Nothing is locked.
3. **Movement toward mastery, not grades.** Progress is shown as **mastery per topic** (a question is
   "mastered" after being answered correctly *N* times, spaced), not as a single ego-bruising %.
   Mistaken questions resurface (lightweight spaced repetition) until mastered — the *isolation of
   difficulty*: drill exactly the weak spot.
4. **Calm, orderly, beautiful environment.** Montessori materials are tactile and aesthetically
   considered. The UI is calm and precise (see §6) so attention goes to learning, not chrome.

> Design rule of thumb: **practice mode is for learning (full feedback, no pressure); exam mode is
> for measuring (no feedback, real constraints).** Never blur the two.

---

## 5. Scope

### 5.1 Must preserve (legacy functional baseline)
Everything the legacy app did, ported and improved:
- All questions & images; category multi-select; search.
- Practice mode (shuffled); **repeat-wrong** mode; **exam mode** (timed); results with mistake list.
- Bookmarks; per-category stats; **localStorage** persistence; study guide (*studijní průvodce*).

### 5.2 New in this version
- **Authoritative, corrected data** (837 q; fixed answer key; real 2026 exam rules). *(done)*
- **Profiles**: Google + magic-link auth; cloud-synced progress; offline-first with merge.
- **Mastery + spaced repetition** of missed questions.
- **"Metal, not aggression"** design system; fully **responsive** & **accessible**.
- Free hosting on **GitHub Pages**; CI with tests + auto-deploy.

### 5.3 Non-goals (for now)
- The practical/shooting part. · Native mobile apps. · Payments. · Social/leaderboards (runs counter
  to the punishment-free ethos). · Authoring/admin UI for editing questions (data is generated from
  the official source).

---

## 6. Experience & visual direction — "metal, not aggression"

The subject is firearms; the tone must be **refined, serious, and calm** — the feel of precision
engineering and well-made tools, **never** tactical/militaristic aggression.

- **Palette:** gunmetal and brushed-steel neutrals (cool greys, near-black), a single **restrained
  amber/brass** accent for focus and "correct". Success = calm green-steel; error = muted, never alarming red.
- **Material:** subtle brushed-metal texture and fine hairline borders; soft, low, diffuse shadows
  (machined, not flashy). Motion is **quiet and purposeful** (gentle reveals, no bounce).
- **Typography:** clean humanist sans for body; a touch of precision (tabular numerals for scores).
  Czech diacritics must render perfectly.
- **Voice:** plain, respectful Czech. Encouraging, never gamified-cute, never militaristic.
- **Accessibility:** WCAG AA contrast, full keyboard play (answer with 1/2/3, Enter to advance),
  visible focus, screen-reader labels, reduced-motion support, ≥44 px touch targets.

---

## 7. Architecture (summary; detail in `/docs`)

- **Frontend:** Vite + React + TypeScript, static, hosted on **GitHub Pages**.
- **Data:** pre-built `questions.json` + `meta.json` (from `data/extract.py`); images served statically.
- **Persistence:** offline-first **localStorage** as the source of truth; **Supabase** (Postgres +
  Auth) for optional cloud sync (Google OAuth + magic link), gated behind env vars and merged on login.
- **Quality:** **TDD** with Vitest + React Testing Library (domain & components) and Playwright (E2E);
  CI runs tests then deploys.

---

## 8. Success metrics

- **Primary (efficacy):** rising exam-sim pass rate per user; % of catalogue mastered; mistakes
  retired over time.
- **Engagement:** D1/D7 return; questions/session; review-mode usage.
- **Quality bar:** 100 % answer-key fidelity vs official source; AA accessibility; Lighthouse ≥95
  perf/a11y; green CI.
- **Definition of done (v1):** the author can run a full timed exam simulation, see mastery grow,
  resume across sessions, optionally sign in to sync — all live on the public URL.
