#!/usr/bin/env python3
"""Extract the authoritative zbrojní oprávnění question set from the official
MV ČR PDF, repairing the font/ligature corruption, detecting correct answers
(italic spans), mapping images, and cross-checking against the legacy jsx.

Source of truth: data/source/mv-2026-otazky-full.pdf (valid from 2026-01-01,
Act 90/2024 Sb.). Correct answers are marked italic + grey-highlighted.
"""
import json
import os
import re
import sys
import unicodedata

import fitz  # PyMuPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "data", "source", "mv-2026-otazky-full.pdf")
IMG_DIR = os.path.join(ROOT, "img")
JSX = os.path.join(ROOT, "zbrojni-kviz.jsx")
OUT = os.path.join(ROOT, "data", "questions.json")

# Category by question-number range (continuous numbering in the PDF).
RANGES = [
    (1, 561, "Zákon o zbraních"),
    (562, 609, "Prováděcí předpisy"),
    (610, 648, "Jiné předpisy"),
    (649, 799, "Nauka o zbraních"),
    (800, 837, "Zdravotnické minimum"),
]

# Standard typographic ligatures that PyMuPDF returns as single codepoints.
LIGATURES = {
    "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl",
    "ﬃ": "ffi", "ﬄ": "ffl", "ﬅ": "ft", "ﬆ": "st",
}

# The "ti/tí" letter cluster has no ToUnicode entry and maps to different
# codepoints depending on the font (regular / bold / italic). The "ft" cluster
# maps to U+014C. We canonicalise the ti/tí variants to U+FFFD then resolve
# ti-vs-tí per word via CORR. (U+2030 ‰ and U+2250 ≐ are legitimate symbols.)
GLYPHS = {"Ɵ": "�", "ơ": "�", "Ō": "ft"}

# The font's "ti/tí/ft" glyph cluster has no ToUnicode entry -> U+FFFD.
# Resolved word-by-word from context against the official PDF. Keys hold the
# literal U+FFFD ('�') after ligature expansion.
F = "�"
CORR = {
    f"pos{F}ženého": "postiženého", f"iden{F}": "identi",
    f"rozhodnu{F}": "rozhodnutí", f"naby{F}": "nabytí",
    f"zajis{F}t": "zajistit", f"odně{F}": "odnětí",
    f"použi{F}": "použití", f"pos{F}žený": "postižený",
    f"konče{F}nu": "končetinu", f"{F}m": "tím",
    f"povinnos{F}": "povinnosti", f"konče{F}ny": "končetiny",
    f"součás{F}": "součásti", f"pro{F}": "proti",
    f"činnos{F}": "činnosti", f"bezpečnos{F}": "bezpečnosti",
    f"zle{F}lá": "zletilá", f"uplynu{F}": "uplynutí",
    f"rozhodnu{F}m": "rozhodnutím", f"pro{F}právního": "protiprávního",
    f"lis{F}ny": "listiny", f"ins{F}tuce": "instituce",
    f"dopus{F}": "dopustí", f"{F}mto": "tímto", f"čás{F}": "části",
    f"způsobilos{F}": "způsobilosti", f"zjis{F}t": "zjistit",
    f"převze{F}": "převzetí", f"okolnos{F}": "okolnosti",
    f"odvrá{F}t": "odvrátit", f"oblas{F}": "oblasti",
    f"ak{F}vních": "aktivních", f"ak{F}vní": "aktivní",
    f"žádos{F}": "žádosti", f"čtvrtle{F}": "čtvrtletí",
    f"znehodno{F}": "znehodnotí", f"započe{F}m": "započetím",
    f"vdechnu{F}": "vdechnutí", f"upus{F}la": "upustila",
    f"teku{F}n": "tekutin", f"spolehlivos{F}": "spolehlivosti",
    f"skutečnos{F}": "skutečnosti", f"přítomnos{F}": "přítomnosti",
    f"přiměřenos{F}": "přiměřenosti", f"přije{F}": "přijetí",
    f"přemís{F}t": "přemístit", f"přemís{F}": "přemístí",
    f"použi{F}m": "použitím", f"pla{F}": "platí",
    f"platnos{F}": "platnosti", f"odpovědnos{F}": "odpovědnosti",
    f"nepřipouš{F}": "nepřipouští", f"nabi{F}": "nabití",
    f"kri{F}cké": "kritické", f"Pos{F}ženému": "Postiženému",
    f"Pos{F}ženého": "Postiženého", f"{F}tul": "titul",
    f"š{F}pání": "štípání", f"š{F}pne": "štípne",
    f"účinnos{F}": "účinnosti", f"zvednu{F}": "zvednutí",
    f"zle{F}lým": "zletilým", f"zle{F}lé": "zletilé",
    f"zle{F}lou": "zletilou", f"zle{F}lost": "zletilost",
    f"zjis{F}li": "zjistili", f"za{F}mco": "zatímco",
    f"vzdálenos{F}": "vzdálenosti", f"vy{F}ženost": "vytíženost",
    f"vyčis{F}t": "vyčistit", f"využi{F}": "využití",
    f"vrá{F}li": "vrátili", f"vlastnos{F}": "vlastnosti",
    f"veřejnos{F}": "veřejnosti", f"velikos{F}": "velikosti",
    f"upus{F}t": "upustit", f"upus{F}l": "upustil",
    f"uplynu{F}m": "uplynutím", f"událos{F}": "události",
    f"subjek{F}vního": "subjektivního", f"stanoviš{F}": "stanovišti",
    f"spravedlnos{F}": "spravedlnosti", f"současnos{F}": "současnosti",
    f"souvislos{F}": "souvislosti", f"slabos{F}": "slabosti",
    f"působnos{F}": "působnosti", f"připouš{F}": "připouští",
    f"přebi{F}": "přebití", f"pro{F}právním": "protiprávním",
    f"problema{F}kou": "problematikou", f"preven{F}vně": "preventivně",
    f"po{F}žích": "potížích", f"pověs{F}": "pověsti",
    f"pos{F}ženým": "postiženým", f"pos{F}žení": "postižení",
    f"pos{F}ženému": "postiženému", f"pos{F}žené": "postižené",
    f"polole{F}": "pololetí", f"poli{F}ckém": "politickém",
    f"opus{F}l": "opustil", f"opomenu{F}m": "opomenutím",
    f"odmítnu{F}": "odmítnutí", f"ochrnu{F}": "ochrnutí",
    f"no{F}fikaci": "notifikaci", f"no{F}": "noti",
    f"nez{F}ží": "neztíží", f"neznalos{F}": "neznalosti",
    f"nezaní{F}la": "nezanítila", f"neplatnos{F}": "neplatnosti",
    f"neodpovědnos{F}": "neodpovědnosti", f"nabi{F}m": "nabitím",
    f"místnos{F}": "místnosti", f"možnos{F}": "možnosti",
    f"mas{F}": "mastí", f"konče{F}ně": "končetině",
    f"konče{F}na": "končetina", f"ins{F}tucí": "institucí",
    f"ins{F}tuci": "instituci", f"iden{F}tou": "identitou",
    f"iden{F}cký": "identický", f"hypote{F}ckému": "hypotetickému",
    f"hypote{F}cky": "hypoteticky", f"hydrosta{F}cký": "hydrostatický",
    f"e{F}ckému": "etickému", f"dě{F}": "dětí", f"du{F}ně": "dutině",
    f"dušnos{F}": "dušnosti", f"dopus{F}la": "dopustila",
    f"deak{F}vaci": "deaktivaci", f"cí{F}t": "cítit",
    f"charita{F}vní": "charitativní", f"cer{F}fikát": "certifikát",
    f"cer{F}": "certi", f"budoucnos{F}": "budoucnosti",
    f"boles{F}vý": "bolestivý", f"boles{F}vé": "bolestivé",
    f"blízkos{F}": "blízkosti", f"balis{F}ckého": "balistického",
    f"balis{F}cko": "balisticko", f"ak{F}vními": "aktivními",
    f"ak{F}vitou": "aktivitou", f"airso{F}ové": "airsoftové",
    f"airso{F}ovou": "airsoftovou", f"administra{F}vních": "administrativních",
    f"Zajis{F}me": "Zajistíme", f"Lis{F}nou": "Listinou",
    f"Kriminalis{F}ckému": "Kriminalistickému", f"Ak{F}vní": "Aktivní",
}


def expand_ligatures(s):
    for lig, rep in LIGATURES.items():
        s = s.replace(lig, rep)
    for g, rep in GLYPHS.items():
        s = s.replace(g, rep)
    return s


def repair(s):
    s = expand_ligatures(s)
    if F not in s:
        return s
    # Replace whole corrupted words; longest keys first to avoid partial hits.
    for bad in sorted(CORR, key=len, reverse=True):
        if bad in s:
            s = s.replace(bad, CORR[bad])
    return s


SECTION_RE = re.compile(
    r"^(I|II|III|IV|V)\.\s+(Zákon o zbraních|Prováděcí|Jiné|Nauka|Zdravotnick)")
ROMAN_RE = re.compile(r"^(I|II|III|IV|V)\.$")
TITLE_RE = re.compile(
    r"^(Zákon o zbraních a střelivu|Prováděcí právní předpisy|"
    r"Jiné právní předpisy|Nauka o zbraních a střelivu|"
    r"Zdravotnické minimum):?$")


def category_for(num):
    for lo, hi, name in RANGES:
        if lo <= num <= hi:
            return name
    return None


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def is_grey_highlight(fill):
    if fill is None:
        return False
    r, g, b = fill[0], fill[1], fill[2]
    return (0.75 < r < 0.92 and abs(r - g) < 0.03 and abs(r - b) < 0.03)


def highlight_rects(page):
    rects = []
    for dr in page.get_drawings():
        if not is_grey_highlight(dr.get("fill")):
            continue
        for it in dr["items"]:
            if it[0] == "re":
                rects.append(it[1])
    return rects


def join_spans(spans):
    """Concatenate spans inserting a space only where geometry implies one
    (a real word gap or a line break) — not at glyph-induced span splits."""
    out = []
    prev = None
    for s in spans:
        t = s["text"]
        if not t:
            continue
        if prev is not None:
            px0, py0, px1, py1 = prev["bbox"]
            x0, y0, x1, y1 = s["bbox"]
            same_line = abs(y0 - py0) < 3
            gap = x0 - px1
            if (not same_line) or gap > 1.0:
                if not out[-1].endswith(" ") and not t.startswith(" "):
                    out.append(" ")
        out.append(t)
        prev = s
    return "".join(out)


def parse_pdf():
    doc = fitz.open(PDF)
    questions = {}
    cur = None  # current question dict; q/a/b/c hold lists of spans
    cur_opt = None  # 'a'/'b'/'c'

    def flush():
        nonlocal cur
        if cur and cur["a"] and cur["b"] and cur["c"]:
            for k in ("q", "a", "b", "c"):
                cur[k] = join_spans(cur[k])
            questions[cur["id"]] = cur

    def mark(opt, kind):
        # Record correct answer; highlight beats italic, never silently flip.
        if cur["correct"] is None:
            cur["correct"] = opt
            cur["_mark"] = kind
        elif cur["correct"] != opt:
            if kind == "highlight" and cur.get("_mark") == "italic":
                cur["correct"] = opt
                cur["_mark"] = kind
            else:
                cur.setdefault("_conflict", []).append((opt, kind))

    qnum_re = re.compile(r"^(\d+)\.\s*(.*)$", re.S)
    opt_re = re.compile(r"^([ABCabc])\)\s*(.*)$", re.S)

    def sub_span(span, text):
        # a shallow span carrying overridden text but original bbox
        return {"text": text, "bbox": span["bbox"], "flags": span["flags"]}

    for page in doc:
        d = page.get_text("dict")
        pageno = page.number + 1
        spans = []
        for b in d["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    t = s["text"].strip()
                    if not t:
                        continue
                    if t.isdigit() and int(t) == pageno:  # footer page number
                        continue
                    spans.append(s)
        # Drop section headers, whether one span ("III. Jiné…") or split into
        # a roman-numeral span followed by the title span.
        cleaned = []
        j = 0
        while j < len(spans):
            t = spans[j]["text"].strip()
            if SECTION_RE.match(t):
                j += 1
                continue
            if ROMAN_RE.match(t) and j + 1 < len(spans) and \
                    TITLE_RE.match(spans[j + 1]["text"].strip()):
                j += 2
                continue
            cleaned.append(spans[j])
            j += 1
        spans = cleaned
        hrects = highlight_rects(page)

        def in_highlight(span):
            x0, y0, x1, y1 = span["bbox"]
            yc = (y0 + y1) / 2
            for r in hrects:
                if r.y0 - 1 <= yc <= r.y1 + 1 and x0 < r.x1 and x1 > r.x0:
                    return True
            return False

        for i, s in enumerate(spans):
            raw = s["text"]
            txt = raw.strip()
            bold = bool(s["flags"] & 16)
            italic = bool(s["flags"] & 2)

            m_num = qnum_re.match(txt)
            nxt_bold = (i + 1 < len(spans)) and bool(spans[i + 1]["flags"] & 16)
            if m_num and (bold or nxt_bold) and category_for(int(m_num.group(1))):
                num = int(m_num.group(1))
                flush()
                cur = {"id": num, "cat": category_for(num),
                       "q": [], "a": [], "b": [], "c": [], "correct": None}
                cur_opt = None
                rest = m_num.group(2)
                if rest.strip():
                    cur["q"].append(sub_span(s, rest))
                continue
            if cur is None:
                continue

            m_opt = opt_re.match(txt)
            if m_opt:
                cur_opt = m_opt.group(1).lower()
                cur[cur_opt].append(sub_span(s, m_opt.group(2)))
                if in_highlight(s):
                    mark(cur_opt, "highlight")
                elif italic:
                    mark(cur_opt, "italic")
                continue
            # Continuation
            if cur_opt is None:
                cur["q"].append(s)
            else:
                cur[cur_opt].append(s)
                if in_highlight(s):
                    mark(cur_opt, "highlight")
                elif italic:
                    mark(cur_opt, "italic")
    flush()
    for q in questions.values():
        q.pop("_mark", None)
    return questions


def map_images(qid):
    imgs = []
    if not os.path.isdir(IMG_DIR):
        return imgs
    k = 0
    while True:
        for ext in ("png", "jpeg", "jpg"):
            fn = f"q{qid}_{k}.{ext}"
            if os.path.exists(os.path.join(IMG_DIR, fn)):
                imgs.append(fn)
                break
        else:
            break
        k += 1
    return imgs


def parse_jsx():
    txt = open(JSX, encoding="utf-8").read()
    out = {}
    rec = re.compile(
        r"\{id:(\d+),cat:`([^`]*)`,q:`((?:[^`\\]|\\.)*)`,"
        r"a:`((?:[^`\\]|\\.)*)`,b:`((?:[^`\\]|\\.)*)`,"
        r"c:`((?:[^`\\]|\\.)*)`,correct:\"([abc])\"\}")
    for m in rec.finditer(txt):
        out[int(m.group(1))] = {"correct": m.group(7), "cat": m.group(2)}
    return out


def main():
    qs = parse_pdf()
    # Repair text
    for q in qs.values():
        q["q"] = clean(repair(q["q"]))
        for o in "abc":
            q[o] = clean(repair(q[o]))
        q["images"] = map_images(q["id"])

    ids = sorted(qs)
    out = [qs[i] for i in ids]

    # --- Reports ---
    print(f"Parsed questions: {len(out)}")
    expected = set(range(1, 838))
    missing = sorted(expected - set(ids))
    extra = sorted(set(ids) - expected)
    print(f"Missing ids vs 1..837: {missing}")
    print(f"Extra ids: {extra}")

    from collections import Counter
    cats = Counter(q["cat"] for q in out)
    print("Per-category:", dict(cats))

    no_correct = [q["id"] for q in out if not q["correct"]]
    print(f"Questions with NO detected correct answer: {len(no_correct)} {no_correct[:20]}")
    conflicts = [(q["id"], q["correct"], q["_conflict"]) for q in out if q.get("_conflict")]
    print(f"Marker conflicts: {len(conflicts)} {conflicts[:10]}")
    for q in out:
        q.pop("_conflict", None)

    # remaining corruption (canonical marker + any raw glyph variants)
    suspect = F + "".join(GLYPHS) + "".join(LIGATURES)
    bad = []
    for q in out:
        blob = q["q"] + q["a"] + q["b"] + q["c"]
        if any(ch in blob for ch in suspect):
            words = re.findall(r"[^\W\d_]*[" + suspect + r"][^\W\d_]*", blob)
            bad += words
    if bad:
        print(f"UNMAPPED corruption words ({len(bad)}):", sorted(set(bad)))
    else:
        print("No remaining corruption glyphs. Text fully repaired.")

    # ligature leftovers
    leftover_lig = set()
    for q in out:
        for ch in q["q"] + q["a"] + q["b"] + q["c"]:
            if ch in LIGATURES:
                leftover_lig.add(ch)
    print("Leftover ligature chars:", leftover_lig or "none")

    # images
    with_img = [q["id"] for q in out if q["images"]]
    print(f"Questions with images: {len(with_img)} (e.g. {with_img[:5]})")

    # cross-check vs jsx
    jsx = parse_jsx()
    print(f"jsx questions: {len(jsx)}")
    only_pdf = sorted(set(ids) - set(jsx))
    only_jsx = sorted(set(jsx) - set(ids))
    print(f"In PDF not jsx: {only_pdf}")
    print(f"In jsx not PDF: {only_jsx}")
    mism = [(i, qs[i]["correct"], jsx[i]["correct"])
            for i in ids if i in jsx and qs[i]["correct"] != jsx[i]["correct"]]
    print(f"Correct-answer mismatches PDF vs jsx: {len(mism)}")
    for i, p, j in mism[:40]:
        print(f"  q{i}: PDF={p} jsx={j}")

    if "--write" in sys.argv:
        json.dump(out, open(OUT, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        print(f"Wrote {OUT} ({len(out)} questions)")


if __name__ == "__main__":
    main()
