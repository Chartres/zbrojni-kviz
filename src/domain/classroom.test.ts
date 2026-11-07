// Test C (2026-11-07): exam prep through instructors, with no backend. The learner's summary
// travels in a link they send; the instructor's device keeps the class.
import { describe, it, expect } from 'vitest'
import {
  addToClass,
  buildSummary,
  decodeSummary,
  encodeSummary,
  formatCode,
  makeClassCode,
  parseCode,
  summaryLink,
  summaryFromText,
  type ClassRoom,
} from './classroom'
import { makeRng } from './rng'
import { emptyProgress, recordAnswer, recordExamAttempt } from './progress'
import { questionsForGroup } from './questions'

const learner = { name: 'Petr N.', id: 'l-abc123' }

function someProgress() {
  let p = emptyProgress()
  for (const q of questionsForGroup('bezpecnost').slice(0, 10)) p = recordAnswer(p, q.id, true, 1)
  p = recordExamAttempt(p, { at: 1000, score: 27, total: 30, passed: true, byCategory: {} })
  p = recordExamAttempt(p, { at: 2000, score: 24, total: 30, passed: false, byCategory: {} })
  return p
}

describe('class codes', () => {
  it('are 6 unambiguous characters, shown as XXX-XXX', () => {
    const code = makeClassCode(makeRng(1))
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/)
    expect(formatCode('K7QM2D')).toBe('K7Q-M2D')
  })

  it('accept what a person types: lower case, spaces, the dash', () => {
    expect(parseCode(' k7q-m2d ')).toBe('K7QM2D')
    expect(parseCode('k7q m2d')).toBe('K7QM2D')
    expect(parseCode('K7QM2')).toBeNull()
    expect(parseCode('K7QM2O')).toBeNull() // O is not in the alphabet (looks like 0)
  })
})

describe('the learner summary', () => {
  it('carries readiness per part, the pass estimates and the last mock exams', () => {
    const s = buildSummary(someProgress(), { code: 'K7QM2D', ...learner }, 5000)
    expect(s.c).toBe('K7QM2D')
    expect(s.n).toBe('Petr N.')
    expect(s.r.map((r) => r.g)).toEqual(['pravni', 'nauka', 'bezpecnost', 'zdravotnicke'])
    const safety = s.r.find((r) => r.g === 'bezpecnost')!
    expect(safety.seen).toBe(10)
    expect(s.e).toEqual([
      [2000, 24, 30, 0],
      [1000, 27, 30, 1],
    ])
    expect(s.p26).toBeGreaterThanOrEqual(0)
    expect(s.p26).toBeLessThanOrEqual(100)
  })

  it('round-trips through a link fragment, Czech names included, and stays short', () => {
    const s = buildSummary(someProgress(), { code: 'K7QM2D', name: 'Žaneta Řezníčková', id: 'l-1' }, 5000)
    const link = summaryLink('https://zbrojnikviz.dravec.org', s)
    expect(link).toMatch(/^https:\/\/zbrojnikviz\.dravec\.org\/instruktor\/#z1\./)
    expect(link.length).toBeLessThan(1000)
    expect(summaryFromText(link)).toEqual(s)
    expect(decodeSummary(encodeSummary(s))).toEqual(s)
  })

  it('rejects anything that is not a well-formed summary', () => {
    expect(decodeSummary('z1.notbase64!!')).toBeNull()
    expect(decodeSummary('z2.' + encodeSummary(buildSummary(emptyProgress(), { code: 'K7QM2D', ...learner }, 1)).slice(3))).toBeNull()
    expect(summaryFromText('hello')).toBeNull()
    const s = buildSummary(emptyProgress(), { code: 'K7QM2D', ...learner }, 1)
    expect(decodeSummary(encodeSummary({ ...s, c: 'BAD' }))).toBeNull()
    expect(decodeSummary(encodeSummary({ ...s, n: 'x'.repeat(200) }))).toBeNull()
  })
})

describe('the instructor class', () => {
  const room: ClassRoom = { code: 'K7QM2D', label: 'Kurz listopad', ref: 'k03', createdAt: 1, learners: {} }

  it('adds a learner once and keeps their newest summary', () => {
    const older = buildSummary(emptyProgress(), { code: 'K7QM2D', ...learner }, 100)
    const newer = buildSummary(someProgress(), { code: 'K7QM2D', ...learner }, 200)
    let r = addToClass(room, older, 150)
    r = addToClass(r, newer, 250)
    r = addToClass(r, older, 300) // an old link opened again does not overwrite
    expect(Object.keys(r.learners)).toEqual(['l-abc123'])
    expect(r.learners['l-abc123'].t).toBe(200)
  })

  it('ignores a summary for another class', () => {
    const other = buildSummary(emptyProgress(), { code: 'ABCDEF', ...learner }, 100)
    expect(addToClass(room, other, 1)).toBe(room)
  })
})

describe('review fixes', () => {
  it('a summary from a clock far ahead is pinned to now, so a later one still replaces it', async () => {
    const { addToClass: add } = await import('./classroom')
    const room = { code: 'K7QM2D', label: '', ref: null, createdAt: 1, learners: {} }
    const future = buildSummary(emptyProgress(), { code: 'K7QM2D', name: 'X', id: 'l-9' }, 9e15)
    const r = add(room, future, 1000)
    expect(r.learners['l-9'].t).toBe(1000)
    const later = buildSummary(emptyProgress(), { code: 'K7QM2D', name: 'X', id: 'l-9' }, 2000)
    expect(add(r, later, 2000).learners['l-9'].t).toBe(2000)
  })

  it('a corrupt learner entry in storage is dropped, not fatal', async () => {
    const { normalizeClass } = await import('./classroom')
    const ok = buildSummary(emptyProgress(), { code: 'K7QM2D', name: 'A', id: 'l-1' }, 1)
    const c = normalizeClass({ code: 'K7QM2D', label: 'x', ref: null, createdAt: 1, learners: { 'l-1': { ...ok, received: 1 }, bad: { n: 1 } } })!
    expect(Object.keys(c.learners)).toEqual(['l-1'])
    expect(normalizeClass({ code: 'nope', learners: {} })).toBeNull()
  })
})

describe('Otázka dne in the summary (test D, ranking route 1: within a class, no shared data)', () => {
  it('carries the last 7 days answered and correct when the learner takes part', async () => {
    const { emptyDaily, recordDaily } = await import('./daily')
    let d = { ...emptyDaily(), optedIn: true }
    d = recordDaily(d, '2026-11-06', true)
    d = recordDaily(d, '2026-11-07', false)
    const now = Date.UTC(2026, 10, 7, 12)
    const s = buildSummary(emptyProgress(), { code: 'K7QM2D', name: 'A', id: 'l-1' }, now, { daily: d, today: '2026-11-07' })
    expect(s.q).toEqual({ a: 2, c: 1 })
    expect(decodeSummary(encodeSummary(s))).toEqual(s)
    const off = buildSummary(emptyProgress(), { code: 'K7QM2D', name: 'A', id: 'l-1' }, now, { daily: emptyDaily(), today: '2026-11-07' })
    expect(off.q).toBeUndefined()
    expect(decodeSummary(encodeSummary({ ...s, q: { a: 9, c: 1 } }))).toBeNull()
  })
})
