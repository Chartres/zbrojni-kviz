"""Parse an act from zakonyprolidi.cz into citable provisions.

Usage: python3 -I law.py <saved.html> <act-id e.g. 2024-90> <short name> > law/<act-id>.json

Each provision is the smallest numbered unit on the page (§, odstavec, písmeno, bod, or a point
of an annex) with its own text and a stable anchor, so the app can quote it verbatim and link
straight to it. Czech legal texts are úřední díla (§ 3 zákona č. 121/2000 Sb.) and may be
reproduced freely. Standard library only.
"""
import html
import json
import re
import sys
from datetime import date

P = re.compile(r'<p class="([^"]*)"[^>]*>(.*?)</p>', re.S)
TAG = re.compile(r'<[^>]+>')
NOTE = re.compile(r'<a class="linknote".*?</a>', re.S)
PID = re.compile(r'<i id="(p[0-9][^"]*)"')
FID = re.compile(r'<a id="(f[0-9]+)"')
VAR = re.compile(r'<var>(.*?)</var>', re.S)
ANNEX = re.compile(r'^Příloha č\. (\d+)$')


def clean(s: str) -> str:
    s = NOTE.sub('', s)
    s = VAR.sub('', s)
    s = TAG.sub('', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def label_for(pid: str) -> str:
    """p20-3-a → '§ 20 odst. 3 písm. a)'; p20-3-c-1 → '§ 20 odst. 3 písm. c) bod 1'."""
    parts = pid[1:].split('-')
    out = f'§ {parts[0]}'
    rest = parts[1:]
    if rest and rest[0].isdigit():
        out += f' odst. {rest.pop(0)}'
    if rest and rest[0].isalpha():
        out += f' písm. {rest.pop(0)})'
    if rest:
        out += f' bod {rest.pop(0)}'
    return out


def parse(doc: str):
    units, annex, stack = [], None, []
    for cls, body in P.findall(doc):
        text = clean(body)
        if not text:
            continue
        m = ANNEX.match(text)
        if m:
            annex, stack = m.group(1), []
            continue
        pid = PID.search(body)
        fid = FID.search(body)
        num = VAR.search(body)
        if pid:
            if text.startswith('§'):
                continue  # the bare "§ 20" heading
            ident, anchor, label = pid.group(1), pid.group(1), label_for(pid.group(1))
            lead_key = ident.rsplit('-', 1)[0] if '-' in ident else None
        elif annex and fid and num and not clean(num.group(1)).endswith(')'):  # "9)" = footnote
            point = clean(num.group(1))
            ident, anchor, label = f'a{annex}-{point}', fid.group(1), f'příloha č. {annex} bod {point}'
            lead_key = f'a{annex}-{point.rsplit(".", 1)[0]}' if '.' in point.strip('.') else None
        else:
            continue
        units.append({'id': ident, 'label': label, 'anchor': anchor, 'text': text, 'parent': lead_key})
    by_id = {u['id']: u for u in units}
    for u in units:
        # keep only parents that exist (odst. 3 → its lead-in "…prokáže, že je odborně způsobilý, pokud")
        if u['parent'] not in by_id:
            u['parent'] = None
    return units


def main():
    path, act, name = sys.argv[1], sys.argv[2], sys.argv[3]
    doc = open(path, encoding='utf-8').read()
    units = parse(doc)
    json.dump(
        {
            'act': act,
            'name': name,
            'url': f'https://www.zakonyprolidi.cz/cs/{act}',
            'retrieved': date.today().isoformat(),
            'units': units,
        },
        sys.stdout,
        ensure_ascii=False,
        indent=1,
    )


if __name__ == '__main__':
    main()
