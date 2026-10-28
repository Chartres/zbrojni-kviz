"""Link each official question to the provision of the law it tests (ad fontes).

Usage: python3 -I cite.py [--app] questions.json 'law/2024-90.json=Zákon o zbraních' [more…] > out
(each act is searched only for questions of the listed categories; without --app the output
carries every candidate with its scores, for review; with --app only accepted links, for the app)

MV writes most legal questions as "stem + option = a sentence of the act", so the provision a
question tests is the one that contains the correct option's distinctive words (those the wrong
options lack) and the stem's words. We score every provision by IDF-weighted coverage of both and
keep a match only when it is clearly better than the runner-up and clearly favours the correct
option over the wrong ones. Anything below that stays unlinked: a missing citation is honest, a
wrong one is not. Standard library only; deterministic.
"""
import json
import math
import re
import sys
import unicodedata
from collections import Counter

WORD = re.compile(r'[0-9a-záčďéěíňóřšťúůýž]+')
STEM = 5
STOP = set('''a i o u v ve z ze k ke s se na do od po za pro pri při je jsou byt být nebo ani
ale ten tato tento tyto ktery který ktera která ktere které jeho jejich jejiz jehoz tak take také
jen pouze vsak však jako aby podle tohoto zakona zákona zakon zákon jde li jde-li nez než
'''.split())


def fold(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')


def stems(text: str) -> list[str]:
    out = []
    for w in WORD.findall(text.lower()):
        if w in STOP or len(w) < 3:
            continue
        out.append(fold(w)[:STEM])
    return out


NEAR = 0.05
# Acceptance, calibrated on a blind grade of 60 links (data/README.md "Citations"):
MIN_SCORE, MIN_MARGIN, MIN_RUN = 0.6, 0.05, 4


def words(s: str) -> list[str]:
    return WORD.findall(s.lower())


def longest_run(a: list[str], b: list[str]) -> int:
    """Longest run of consecutive words shared verbatim — MV lifts answers from the act."""
    best, prev = 0, [0] * (len(b) + 1)
    for x in a:
        cur = [0] * (len(b) + 1)
        for j, y in enumerate(b, 1):
            if x == y:
                cur[j] = prev[j - 1] + 1
                best = max(best, cur[j])
        prev = cur
    return best


def shared_ancestor(a: str, b: str) -> str | None:
    """p8-1-a, p8-1-c → p8-1. Anything above an odstavec (p8, or a different §) is too broad."""
    pa, pb = a.split('-'), b.split('-')
    common = []
    for x, y in zip(pa, pb):
        if x != y:
            break
        common.append(x)
    return '-'.join(common) if len(common) >= 2 else None


APP = '--app' in sys.argv  # emit only accepted links, in the shape the app imports


def option(name: str) -> str | None:
    """--reviewed ids.json: keep only links a reviewer graded exact (a list of question ids).
    --merge citations.json: add the result to an existing app file, leaving its links as they are."""
    if name in sys.argv:
        i = sys.argv.index(name)
        value = sys.argv[i + 1]
        del sys.argv[i : i + 2]
        return value
    return None


REVIEWED = option('--reviewed')
MERGE = option('--merge')


def main():
    args = [a for a in sys.argv[1:] if a != '--app']
    questions = json.load(open(args[0], encoding='utf-8'))
    acts = []
    for arg in args[1:]:  # law/2024-90.json=Zákon o zbraních|Jiné předpisy
        path, cats = arg.split('=')
        act = json.load(open(path, encoding='utf-8'))
        act['cats'] = set(cats.split('|'))
        acts.append(act)
    questions = [q for q in questions if any(q['cat'] in a['cats'] for a in acts)]
    units = []
    for act in acts:
        by_id = {u['id']: u for u in act['units']}
        kids: dict[str, list[dict]] = {}
        for u in act['units']:
            if u['parent']:
                kids.setdefault(u['parent'], []).append(u)

        def subtree(u):
            return u['text'] + ' ' + ' '.join(subtree(k) for k in kids.get(u['id'], []))

        for u in act['units']:
            # Annex points: a sub-point's lead carries meaning ("střelivo kategorie S2:" over
            # "náboje se svítící střelou"), a top heading does not ("Druhy zbraní:" would blur all
            # definitions), and an annex point with all its children is a whole glossary.
            in_annex = not u['id'].startswith('p')
            meaningful = u['parent'] and (not in_annex or '.' in u['parent'].split('-', 1)[1])
            lead = by_id[u['parent']]['text'] if meaningful else ''
            quote = (lead + ' … ' if lead else '') + u['text']
            units.append((act, {**u, 'quote': quote}, set(stems(quote))))
            if u['id'] in kids and (not in_annex or '.' in u['id'].split('-', 1)[1]):
                # a provision with its písmena/body, for answers that list several of them
                quote = (lead + ' … ' if lead else '') + subtree(u).strip()
                units.append((act, {**u, 'whole': True, 'quote': quote}, set(stems(quote))))

    df = Counter(s for _, _, st in units for s in st)
    n = len(units)
    idf = lambda s: math.log((n + 1) / (df.get(s, 0) + 1))

    def coverage(target: set[str], have: set[str]) -> float:
        total = sum(idf(s) for s in target)
        return sum(idf(s) for s in target if s in have) / total if total else 0.0

    out = {}
    for q in questions:
        opts = {k: set(stems(q[k])) for k in 'abc'}
        right = opts[q['correct']]
        wrong = set().union(*(opts[k] for k in 'abc' if k != q['correct']))
        distinct = right - wrong
        stem = set(stems(q['q']))
        scored = []
        for act, u, st in units:
            if q['cat'] not in act['cats']:
                continue
            d = coverage(distinct, st) if distinct else coverage(right, st)
            w = max(coverage(opts[k] - right, st) for k in 'abc' if k != q['correct']) if distinct else 0.0
            s = coverage(stem, st)
            scored.append((0.6 * d + 0.4 * s, d, w, s, act, u))
        # prefer the narrowest provision among equal scores (a písmeno over its whole odstavec)
        scored.sort(key=lambda t: (-t[0], bool(t[5].get('whole')), -len(t[5]['id'])))
        best = scored[0]
        score, d, w, s, act, u = best

        def related(x, y):  # same branch of the same act: p20-3 vs p20-3-a is not a rival
            a, b = x['id'], y['id']
            return a == b or a.startswith(b + '-') or b.startswith(a + '-')

        nobody = (0.0, 0.0, 0.0, 0.0, None, {'label': '—', 'id': ''})
        second = next((t for t in scored[1:] if not (t[4] is act and related(t[5], u))), nobody)
        if second[4] is act and second[0] > score - NEAR:
            # Near-tie with a sibling (§ 8 odst. 1 písm. a vs c): the question tests what they
            # share, so cite their common ancestor as a whole when it is at least an odstavec.
            common = shared_ancestor(u['id'], second[5]['id'])
            whole = next((t for t in scored if t[4] is act and t[5]['id'] == common and t[5].get('whole')), None)
            if whole:
                u = whole[5]
                second = next((t for t in scored if not (t[4] is act and related(t[5], u))), nobody)
        prov = words(u['quote'])
        run = max(longest_run(words(q[q['correct']]), prov), longest_run(words(q['q']), prov))
        margin = score - second[0]
        out[q['id']] = {
            'ok': score >= MIN_SCORE and margin >= MIN_MARGIN and run >= MIN_RUN,
            'act': act['act'],
            'unit': u['id'],
            'label': u['label'],
            'anchor': u['anchor'],
            'whole': bool(u.get('whole')),
            'score': round(score, 3),
            'distinct': round(d, 3),
            'wrong': round(w, 3),
            'stem': round(s, 3),
            'margin': round(margin, 3),
            'run': run,
            'rival': second[5]['label'],
            'quote': u['quote'],
        }
    if APP:
        reviewed = set(json.load(open(REVIEWED, encoding='utf-8'))) if REVIEWED else None
        out = {
            'acts': {a['act']: {'name': a['name'], 'url': a['url'], 'retrieved': a['retrieved']} for a in acts},
            'questions': {
                i: {'act': c['act'], 'label': c['label'], 'anchor': c['anchor'], 'quote': c['quote']}
                for i, c in out.items()
                if c['ok'] and (reviewed is None or i in reviewed)
            },
        }
        if MERGE:
            base = json.load(open(MERGE, encoding='utf-8'))
            used = {c['act'] for c in out['questions'].values()}
            base['acts'].update({k: v for k, v in out['acts'].items() if k in used})
            for i, c in out['questions'].items():
                base['questions'].setdefault(str(i), c)
            out = base
    json.dump(out, sys.stdout, ensure_ascii=False, indent=None if APP else 1)


if __name__ == '__main__':
    main()
