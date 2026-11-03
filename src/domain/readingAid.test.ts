// Reading aid "Zvýraznit rozdíly" (Pavol's pick A, 2026-11-03): before answering, the words not
// shared by all three options get a neutral dotted underline. It says where they differ, never
// which one is right.
import { describe, it, expect } from 'vitest'
import { markDifferences } from './difference'
import { getQuestion } from './questions'

const marked = (segs: { text: string; changed: boolean }[]) =>
  segs.filter((s) => s.changed).map((s) => s.text.trim())

describe('markDifferences — words not shared by all three options', () => {
  it('marks the words that differ and nothing that all three share (the bank example)', () => {
    const base = (x: string) =>
      `Povinnost ohlásit převod zbraně se netýká ${x} zbraně podléhající registraci nebo zbraně kategorie PO v souladu se zákonem o zbraních a střelivu.`
    const m = markDifferences([base('pouze přenechání'), base('pouze svěření'), base('ani přenechání ani svěření')])!
    // 'pouze' and 'přenechání' are not in all three options, so they are marked too
    expect(marked(m[0])).toEqual(['pouze přenechání'])
    expect(marked(m[1])).toEqual(['pouze svěření'])
    expect(marked(m[2])).toEqual(['ani přenechání ani svěření'])
  })

  it('keeps every character, so the marked options read exactly as the bank wrote them', () => {
    const opts = ['do 12 měsíců od zápisu,', 'do 6 měsíců od zápisu,', 'do 24 měsíců od podání žádosti.']
    const m = markDifferences(opts)!
    m.forEach((segs, i) => expect(segs.map((s) => s.text).join('')).toBe(opts[i]))
  })

  it('Czech diacritics count: "převod" and "prevod" are different words; case does not count', () => {
    const m = markDifferences(['Převod zbraně hlásí prodávající.', 'prevod zbraně hlásí prodávající.', 'převod zbraně hlásí kupující.'])!
    expect(marked(m[0])).toEqual(['Převod', 'prodávající.'])
    expect(marked(m[1])).toEqual(['prevod', 'prodávající.'])
    // 'převod' is not in all three (one option has 'prevod'), so it is marked there too
    expect(marked(m[2])).toEqual(['převod', 'kupující.'])
  })

  it('composed and decomposed Unicode are the same word (NFC)', () => {
    const composed = 'zbrojní průkaz skupiny A'
    const decomposed = 'zbrojní průkaz skupiny B'.normalize('NFD')
    const m = markDifferences([composed, decomposed, 'zbrojní průkaz skupiny C'])!
    expect(marked(m[1])).toEqual(['B'])
  })

  it('punctuation at a word edge does not make a word differ', () => {
    const m = markDifferences(['kategorie A, B nebo C.', 'kategorie A; B nebo D', 'kategorie (A) B nebo E'])!
    expect(marked(m[0])).toEqual(['C.'])
    expect(marked(m[2])).toEqual(['E'])
    expect(m[0].find((s) => s.text.includes('A,'))!.changed).toBe(false)
  })

  it('returns null when there is nothing worth marking: no word shared by all three, or identical options', () => {
    expect(markDifferences(['ano', 'ne', 'nevím'])).toBeNull()
    expect(markDifferences(['stejně', 'stejně', 'stejně'])).toBeNull()
  })

  it('works on the real bank: q323 marks only what differs, shares "zbrojního oprávnění"', () => {
    const q = getQuestion(323)!
    const m = markDifferences([q.a, q.b, q.c])!
    expect(marked(m[0])).toEqual(['rozšířeného'])
    expect(marked(m[2])).toEqual(['nebo zapsané autorizace.'])
  })
  it('a word in all three options is never marked, whatever the word order (no alignment ties)', () => {
    const m = markDifferences(['zbraň kategorie A', 'kategorie B zbraň', 'zbraň kategorie C'])!
    expect(marked(m[0])).toEqual(['A'])
    expect(marked(m[1])).toEqual(['B'])
    expect(marked(m[2])).toEqual(['C'])
  })

  it('options that share only one word still get marked, not "nothing to compare"', () => {
    const m = markDifferences([
      'regulovanou součástí zbraně.',
      'zákonem o zbraních a střelivu neregulovaným doplňkem zbraně.',
      'regulovanou součástí zbraně za předpokladu, že o tom rozhodne úřad o vlnových délkách.',
    ])!
    expect(m).not.toBeNull()
    expect(m[1].filter((x) => !x.changed).map((x) => x.text.trim())).toContain('zbraně.')
  })
})
