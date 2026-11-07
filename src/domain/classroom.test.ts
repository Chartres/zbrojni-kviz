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
