# Question dataset — provenance & reconciliation

The quiz data in [`questions.json`](./questions.json) (837 questions) and
[`meta.json`](./meta.json) is extracted **directly from the official source**, not from the
legacy `zbrojni-kviz.jsx`.

## Source of truth

- **Ministerstvo vnitra ČR** — *Soubor testových otázek pro teoretickou část zkoušky odborné
  způsobilosti a komisionální zkoušku*, valid from **2026-01-01** under Act **90/2024 Sb.**
- PDF: `source/mv-2026-otazky-full.pdf` (219 pages) ·
  [mv.gov.cz](https://mv.gov.cz/soubor/mv-soubor-testovych-otazek-pro-teoretickou-cast-zkousky-odborne-zpusobilosti-a-komisionalni-zkousku.aspx)
- Correct answers in the PDF are marked by a **grey highlight** + *italic*.

## Extraction (`extract.py`, PyMuPDF)

Run: `python3 -m venv .venv && .venv/bin/pip install PyMuPDF && .venv/bin/python extract.py --write`

- **Categories** by continuous question-number range: Zákon 1–561 · Prováděcí 562–609 ·
  Jiné 610–648 · Nauka 649–799 · Zdravotnické 800–837.
- **Correct answer** = the option overlapping a grey highlight rectangle (primary signal),
  with italic font as a fallback. Every question resolves to exactly one answer.
- **Images** map by number: `img/q{id}_{n}.png` → 71 questions, 73 files, 0 orphans/missing.
- **Text repair.** The PDF font lacks a ToUnicode mapping for the *ti/tí* ligature (rendered as
  `Ɵ`/`ơ`, ~339×) and *ft* (`Ō`); `ﬁ`/`ﬂ` etc. are standard ligatures. These are normalised and
  resolved word-by-word (see `CORR`/`GLYPHS` in `extract.py`). Spurious spaces from span-splitting
  are avoided with geometry-based joining; footer page numbers and section headers are stripped.
  `‰` (e.g. *0,5 ‰ alkoholu*) and `≐` (*≐ 28,35 g*) are legitimate and kept.

## What reconciliation against the official source fixed

The legacy `zbrojni-kviz.jsx` (836 questions) had real defects, corrected here:

| Issue | Legacy jsx | Official 2026 PDF |
|---|---|---|
| Missing question | (none for **q108**) | q108 present → **837 total** |
| **q717** answer key | A | **B** (highlighted in PDF — verified visually) |
| Exam structure | 30 q, pass 26 | see "Exam format" below (an Oct 2026 fix restored 30 q) |

## Exam format (verified 2026-10-27 against the legal texts)

- **Zákon č. 90/2024 Sb. § 20 odst. 3 písm. a)**: 30 questions, at most 40 minutes, pass with
  ≥ 26 correct; ≥ 28 for *rozšířené zbrojní oprávnění*.
- **Nařízení vlády č. 238/2025 Sb. § 12 odst. 2**: 17 legal + 5 weapons science + 5 safe handling
  + 3 first aid; one correct answer of three.
- From June to October 2026 the app ran 60 q / 80 min / pass 57. That is the **examiner's** test
  (§ 34 odst. 5 písm. a), not the applicant's; it was a mix-up, fixed in PR "exam format 2026".
- The MV file has no "safe handling" section. Its handling rules for the exam (q562–596, filed
  under *Prováděcí předpisy*) and its safety principles (q784–799, under *Nauka*) are the only
  questions that match NV 238/2025 § 12 odst. 2 písm. c), so `meta.json` assigns them to that
  part by id range. This is our reading; MV does not publish the mapping.
- Source PDF re-checked 2026-10-27: the file MV links from mv.gov.cz/zbrojni-opravneni (now
  served from archiv.mv.gov.cz) is byte-identical to `source/mv-2026-otazky-full.pdf`
  (sha256 `edd539ef…a04a4`), so the 837-question bank is the current official set.

Authentic duplicates in the official pool (kept as-is): **q523 = q529**, **q587 = q590**.
