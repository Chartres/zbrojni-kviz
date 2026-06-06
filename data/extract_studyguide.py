#!/usr/bin/env python3
"""Extract the legacy study guide into a sanitised HTML fragment (structural
tags only, no framework classes) for the React StudyScreen to render."""
import re
from html.parser import HTMLParser

SRC = "legacy/studijni-pruvodce.html"
OUT = "src/content/studyGuide.ts"

KEEP = {"h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "br", "table",
        "thead", "tbody", "tr", "th", "td"}
SKIP_CONTENT = {"script", "style", "svg", "button", "nav"}


class Extract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out = []
        self.skip_depth = 0
        self.started = False  # start after the first <h2> (skip page header/nav)

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_CONTENT:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag == "h2":
            self.started = True
        if not self.started:
            return
        if tag in KEEP:
            self.out.append(f"<{tag}>")

    def handle_endtag(self, tag):
        if tag in SKIP_CONTENT and self.skip_depth:
            self.skip_depth -= 1
            return
        if self.skip_depth or not self.started:
            return
        if tag in KEEP and tag != "br":
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if self.skip_depth or not self.started:
            return
        text = data.strip()
        if text:
            self.out.append(
                text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            )


p = Extract()
p.feed(open(SRC, encoding="utf-8").read())
html = " ".join(p.out)
html = re.sub(r"\s+", " ", html)

# The legacy guide is NOT a ministry document — strip the author's English-term
# glosses, e.g. "Ráže (Caliber)" -> "Ráže". (Czech notes & abbreviations like
# (AED), (KPR), (EU), (FMJ) are kept.)
ENGLISH_GLOSSES = (
    "Caliber|Bullet|Powder|Primer|Case|receiver|rifle|rifling|shotgun|travers|"
    "heel of hand"
)
html = re.sub(rf"\s*\((?:{ENGLISH_GLOSSES})\)", "", html, flags=re.I)

html = re.sub(r"\s+", " ", html)
html = re.sub(r"\s+</", "</", html)
html = re.sub(r"<(p|li|h[234])>\s+", r"<\1>", html)

ts = (
    "// AUTO-GENERATED from legacy/studijni-pruvodce.html by "
    "data/extract_studyguide.py — do not edit by hand.\n"
    "export const STUDY_GUIDE_HTML = " + repr(html).replace("'", "`", 0) + "\n"
)
# Use a normal double-quoted TS string; escape backticks/backslashes safely.
safe = html.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
ts = (
    "// AUTO-GENERATED from legacy/studijni-pruvodce.html by "
    "data/extract_studyguide.py — do not edit by hand.\n"
    f"export const STUDY_GUIDE_HTML = `{safe}`\n"
)
import os
os.makedirs("src/content", exist_ok=True)
open(OUT, "w", encoding="utf-8").write(ts)
print(f"wrote {OUT}: {len(html)} chars of HTML, {html.count('<h2>')} sections")
