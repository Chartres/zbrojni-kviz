import { describe, it, expect } from 'vitest'
import { readiness, scoreDistribution, MIN_COVERAGE } from './readiness'
import { emptyProgress, recordAnswer, MASTERY_STREAK, type ProgressData } from './progress'
import { questionsForGroup } from './questions'
import type { ExamGroup } from './types'

function master(p: ProgressData, ids: number[]): ProgressData {
  for (const id of ids) for (let i = 0; i < MASTERY_STREAK; i++) p = recordAnswer(p, id, true, 100 + i)
  return p
}
function miss(p: ProgressData, ids: number[]): ProgressData {
  for (const id of ids) p = recordAnswer(p, id, false, 50)
  return p
}
const ids = (g: ExamGroup) => questionsForGroup(g).map((q) => q.id)
const ALL: ExamGroup[] = ['pravni', 'nauka', 'bezpecnost', 'zdravotnicke']

describe('scoreDistribution — exact sum of the four parts', () => {
  it('is certain at the extremes', () => {
    expect(scoreDistribution([{ n: 17, p: 1 }, { n: 13, p: 1 }])[30]).toBeCloseTo(1)
    expect(scoreDistribution([{ n: 30, p: 0 }])[0]).toBeCloseTo(1)
  })
  it('matches the binomial for one part', () => {
    const d = scoreDistribution([{ n: 3, p: 0.5 }])
    expect(d.map((x) => +x.toFixed(3))).toEqual([0.125, 0.375, 0.375, 0.125])
  })
})

describe('readiness — chance of passing the 30-question test (Bloom: mastery, not points)', () => {
  it('withholds the estimate until every part is practised enough', () => {
    const r = readiness(emptyProgress())
    expect(r.enoughData).toBe(false)
    expect(r.parts.every((p) => p.coverage === 0)).toBe(true)
  })

  it('a learner who mastered everything passes almost surely, the extended permit too', () => {
    let p = emptyProgress()
    for (const g of ALL) p = master(p, ids(g))
    const r = readiness(p)
    expect(r.enoughData).toBe(true)
    expect(r.pass).toBeGreaterThan(0.95)
    expect(r.passExtended).toBeGreaterThan(0.8)
    expect(r.passExtended).toBeLessThanOrEqual(r.pass)
  })

  it('names the part that costs the most points', () => {
    let p = emptyProgress()
    for (const g of ['nauka', 'bezpecnost', 'zdravotnicke'] as const) p = master(p, ids(g))
    const legal = ids('pravni')
    p = miss(p, legal.slice(0, Math.ceil(legal.length * MIN_COVERAGE)))
    const r = readiness(p)
    expect(r.enoughData).toBe(true)
    expect(r.weakest).toBe('pravni')
    expect(r.pass).toBeLessThan(0.05)
  })

  it('an unseen question counts as a coin flip, so practice raises the estimate', () => {
    let half = emptyProgress()
    for (const g of ALL) half = master(half, ids(g).slice(0, Math.ceil(ids(g).length * 0.5)))
    let all = emptyProgress()
    for (const g of ALL) all = master(all, ids(g))
    expect(readiness(half).pass).toBeLessThan(readiness(all).pass)
  })
})
