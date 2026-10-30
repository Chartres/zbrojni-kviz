import { describe, it, expect } from 'vitest'
import { CASES, caseBySlug, provisionsFor } from './cases'
import { sourceFor } from './sources'
import { resolveQuote } from '@/seo/examPage.mjs'
import src from '@data/cases.src.json'
import built from '@data/cases.json'
import z90 from '@data/law/2024-90.json'
import tz from '@data/law/2009-40.json'

const ACTS = { '2024-90': z90, '2009-40': tz }

describe('cases (case method)', () => {
  it('has the three situations Pavol named: nutná obrana, carrying, minors', () => {
    expect(CASES.map((c) => c.slug)).toEqual(expect.arrayContaining(['nutna-obrana', 'noseni-zbrane', 'nezletili']))
  })

  it('data/cases.json is current with cases.src.json (run node scripts/cases.mjs)', () => {
    expect(built.cases.map((c) => ({ ...c, provisions: c.provisions.map((p) => ({ ...p.cite, for: p.for })) }))).toEqual(
      src.cases,
    )
  })

  it('every provision is quoted verbatim from the parsed act', () => {
    for (const c of built.cases)
      for (const p of c.provisions) {
        const q = resolveQuote(ACTS, p.cite)
        expect(p.text).toBe(q.text)
        expect(p.label).toBe(q.label)
        expect(p.url).toBe(q.url)
      }
  })

  it('every case has a situation, questions in order, and at least one provision', () => {
    for (const c of CASES) {
      expect(c.situation.length).toBeGreaterThan(40)
      expect(c.questions.length).toBeGreaterThanOrEqual(5)
      expect(new Set(c.questions.map((q) => q.id)).size).toBe(c.questions.length)
      expect(c.provisions.length).toBeGreaterThan(0)
    }
    expect(caseBySlug('nutna-obrana')!.provisions[0].label).toBe('§ 29 odst. 1')
    expect(caseBySlug('nutna-obrana')!.provisions[0].heading).toBe('Ze zákona')
  })

  it('no question sits in two cases', () => {
    const ids = CASES.flatMap((c) => c.questions.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('a provision decides only questions of its own case', () => {
    for (const c of CASES) {
      const ids = new Set(c.questions.map((q) => q.id))
      for (const p of c.provisions) for (const id of p.for) expect(ids.has(id)).toBe(true)
    }
  })

  it('shows no case provision where it would not decide the question (#42, #131)', () => {
    const c = caseBySlug('nezletili')!
    for (const id of [42, 131]) {
      expect(sourceFor(id)).toBeUndefined()
      expect(provisionsFor(c, id)).toEqual([])
    }
    expect(provisionsFor(caseBySlug('noseni-zbrane')!, 325).map((p) => p.label)).toEqual(['§ 81 odst. 1'])
  })
})
