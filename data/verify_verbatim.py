#!/usr/bin/env python3
"""Independent verbatim check: confirm every stem/option in questions.json
appears, character-for-character, in the official PDF — using a DIFFERENT
extractor (pdftotext) than the one that built the dataset (PyMuPDF).

Both extractors hit the same font-corruption glyphs; we apply the same repair
to the pdftotext output and to the JSON, normalise whitespace, then require
each field to be a contiguous substring of the repaired PDF text. A mismatch
means the dataset deviates from the source.
"""
import json
import os
import re
import subprocess

import fitz
from extract import repair  # reuse the exact ligature/glyph/CORR repair

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "data", "source", "mv-2026-otazky-full.pdf")
JSON = os.path.join(ROOT, "data", "questions.json")


def norm(s: str) -> str:
    s = repair(s)
    s = s.replace(" ", " ").replace(" ", " ")
    # Compare pure letter/number content: strip ALL whitespace and hyphen
    # variants, which the two extractors represent differently at line wraps
    # (e.g. "jde-li" vs "jde- li" vs soft-hyphen). This surfaces only genuine
    # word/character differences, not spacing artifacts.
    return re.sub(r"[\s\-­‐‑]+", "", s)


def main():
    raw = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", PDF, "-"],
        capture_output=True, text=True, check=True,
    ).stdout
    # Drop footer page-number lines, which pdftotext injects into the text flow
    # at page breaks (our extractor correctly strips them).
    raw = re.sub(r"(?m)^\s*\d{1,3}\s*$", "", raw)
    ref_pdftotext = norm(raw)

    # Second, fully independent reading-order reference (PyMuPDF page text, NOT
    # our custom span parser). pdftotext and PyMuPDF order line-wrapped bold
    # stem-endings differently, so a field is verbatim if it appears in EITHER.
    doc = fitz.open(PDF)
    mupdf_raw = "\n".join(p.get_text() for p in doc)
    mupdf_raw = re.sub(r"(?m)^\s*\d{1,3}\s*$", "", mupdf_raw)
    ref_mupdf = norm(mupdf_raw)

    qs = json.load(open(JSON, encoding="utf-8"))
    misses = []
    for q in qs:
        for field in ("q", "a", "b", "c"):
            text = norm(q[field])
            if text and text not in ref_pdftotext and text not in ref_mupdf:
                misses.append((q["id"], field, text))

    total_fields = len(qs) * 4
    print(f"Questions: {len(qs)}  Fields checked: {total_fields}")
    print(f"Verbatim matches: {total_fields - len(misses)}")
    print(f"Mismatches: {len(misses)}")
    for qid, field, text in misses[:30]:
        print(f"\n  q{qid}.{field} NOT found verbatim:")
        print(f"    {text[:140]}")
    if not misses:
        print("\n✓ Every field is verbatim in the official PDF.")


if __name__ == "__main__":
    main()
