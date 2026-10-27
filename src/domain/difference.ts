// Control of error (Montessori): when a learner picks a wrong option that is almost the right
// one, show exactly the words that differ, so the error points at its own correction. Official
// banks often build distractors by changing one number, one category or one negation; the
// learner should see that word, not re-read two long sentences side by side.

export interface Segment {
  text: string
  /** True when this word is not in the other option (at that position of the alignment). */
  changed: boolean
}

// Words with the whitespace that follows them, so segments rebuild the original exactly.
const TOKEN = /\S+\s*|\s+/g

function tokens(s: string): string[] {
  return s.match(TOKEN) ?? []
}

function norm(t: string): string {
  return t.trim().toLowerCase().replace(/[.,;:!?„“"()]+$/u, '').replace(/^[„"(]+/u, '')
}

function lcsTable(a: string[], b: string[]): number[][] {
  const t = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1])
    }
  }
  return t
}

function merge(segs: Segment[]): Segment[] {
  const out: Segment[] = []
  for (const s of segs) {
    const last = out[out.length - 1]
    if (last && last.changed === s.changed) last.text += s.text
    else out.push({ ...s })
  }
  return out
}

/** Word-level diff of the chosen (wrong) option against the correct one. */
export function differ(wrongText: string, rightText: string): { wrong: Segment[]; right: Segment[] } {
  const a = tokens(wrongText)
  const b = tokens(rightText)
  const na = a.map(norm)
  const nb = b.map(norm)
  const t = lcsTable(na, nb)
  const wrong: Segment[] = []
  const right: Segment[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (na[i] === nb[j]) {
      wrong.push({ text: a[i++], changed: false })
      right.push({ text: b[j++], changed: false })
    } else if (t[i + 1][j] >= t[i][j + 1]) {
      wrong.push({ text: a[i++], changed: na[i - 1] !== '' })
    } else {
      right.push({ text: b[j++], changed: nb[j - 1] !== '' })
    }
  }
  while (i < a.length) wrong.push({ text: a[i++], changed: true })
  while (j < b.length) right.push({ text: b[j++], changed: true })
  return { wrong: merge(wrong), right: merge(right) }
}

/** Share of the correct option's words that the wrong option also has, in order. */
export function overlap(wrongText: string, rightText: string): number {
  const na = tokens(wrongText).map(norm).filter(Boolean)
  const nb = tokens(rightText).map(norm).filter(Boolean)
  if (!na.length || !nb.length) return 0
  return lcsTable(na, nb)[0][0] / Math.max(na.length, nb.length)
}

/** Worth highlighting: the options share most of their words, so the difference is the lesson. */
export const NEAR_MISS = 0.5

export function isNearMiss(wrongText: string, rightText: string): boolean {
  return overlap(wrongText, rightText) >= NEAR_MISS
}
