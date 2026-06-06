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
| Exam structure | 30 q, pass 26 | **60 q** (52 legal + 5 nauka + 3 zdrav.), pass **57**, **80 min** |

Authentic duplicates in the official pool (kept as-is): **q523 = q529**, **q587 = q590**.
