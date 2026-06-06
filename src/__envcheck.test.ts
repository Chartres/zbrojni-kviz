import { describe, it, expect } from 'vitest'
import { ALL_QUESTIONS, META, getQuestion } from './domain/questions'

// Dataset invariants that protect against regressions in data/extract.py.
describe('dataset invariants', () => {
  it('has unique ids and contiguous numbering 1..837', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id).sort((a, b) => a - b)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe(1)
    expect(ids.at(-1)).toBe(837)
  })

  it('preserves the authentic duplicate pairs from the official set', () => {
    for (const [x, y] of META.duplicatePairs) {
      const a = getQuestion(x)!
      const b = getQuestion(y)!
      expect(a.q).toBe(b.q)
      expect(a.correct).toBe(b.correct)
    }
  })

  it('image references look like question assets', () => {
    for (const q of ALL_QUESTIONS) {
      for (const img of q.images) {
        expect(img).toMatch(/^q\d+_\d+\.(png|jpe?g)$/)
      }
    }
  })
})
