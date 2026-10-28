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

## Citations — the provision each question tests (ad fontes)

`citations.json` links 290 of the 561 *Zákon o zbraních* questions to the provision of
zákon č. 90/2024 Sb. they restate, with the provision quoted verbatim (statutes are úřední díla,
§ 3 zákona č. 121/2000 Sb.) and a deep link to zakonyprolidi.cz.

- `law/2024-90.json`: the act parsed into 1,200+ provisions by `law.py` from the consolidated
  text at https://www.zakonyprolidi.cz/cs/2024-90 (retrieved 2026-10-27; date stored in the file).
- `cite.py` scores every provision by IDF-weighted coverage of the correct option's distinctive
  words and of the stem, and accepts a link only if score ≥ 0.6, it beats the best unrelated
  provision by ≥ 0.05, and it shares ≥ 4 consecutive words verbatim with the answer or stem.
- Calibration: a blind grader judged 60 links → 49 exact, 6 partial, 5 wrong; all 5 wrong ones
  shared ≤ 3 consecutive words, which set the verbatim-run rule. Validation on a fresh 60
  under the final rule: **56 exact, 4 partial, 0 wrong**.
- Questions without a confident link show no citation. A missing citation is honest; a wrong
  one is not.

**Prováděcí and Jiné předpisy** (added 2026-10-27): 30 more links, to NV č. 238/2025 Sb.
(exam rules), NV č. 187/2025 Sb. (technical requirements, storage in a vehicle), zákon
č. 14/2021 Sb. and the trestní zákoník (nutná obrana, krajní nouze). The matcher accepted 37
of 87; a blind grader judged all 37 (30 exact, 5 partial, 2 wrong) and only the 30 exact ones
ship, listed in `law/reviewed-secondary.json`. Also parsed and searched: NV č. 255/2021 Sb.,
zákon č. 156/2000 Sb. Total: **320 of 837 questions** link to their provision.

Regenerate (each act from https://www.zakonyprolidi.cz/cs/<act>, saved to /tmp/<act>.html first):

```bash
python3 -I data/law.py /tmp/2024-90.html 2024-90 "Zákon č. 90/2024 Sb., o zbraních a střelivu" > data/law/2024-90.json
# …same for 2025-238, 2025-187, 2009-40, 2021-14, 2021-255, 2000-156 (names in each law/*.json)
cd data
python3 -I cite.py --app questions.json "law/2024-90.json=Zákon o zbraních" > citations.json
python3 -I cite.py --app --reviewed law/reviewed-secondary.json --merge citations.json questions.json \
  "law/2025-238.json=Prováděcí předpisy" "law/2025-187.json=Prováděcí předpisy" \
  "law/2024-90.json=Prováděcí předpisy|Jiné předpisy" "law/2009-40.json=Jiné předpisy" \
  "law/2021-14.json=Jiné předpisy" "law/2021-255.json=Jiné předpisy" \
  "law/2000-156.json=Jiné předpisy" > /tmp/c.json && mv /tmp/c.json citations.json
```

The two passes are separate because word weights (IDF) depend on which provisions are pooled;
keeping the zákon pass alone keeps its validated links unchanged.
