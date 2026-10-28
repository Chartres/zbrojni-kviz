import { describe, it, expect } from 'vitest'
import { sourceFor, citedCount } from './sources'
import { ALL_QUESTIONS, getQuestion } from './questions'

describe('sourceFor — ad fontes: the provision a question tests', () => {
  it('quotes the provision verbatim with a deep link to it', () => {
    const s = sourceFor(1)!
    expect(s.label).toBe('§ 1 odst. 1')
    expect(s.act).toBe('Zákon č. 90/2024 Sb., o zbraních a střelivu')
    expect(s.url).toBe('https://www.zakonyprolidi.cz/cs/2024-90#p1-1')
    expect(s.quote).toBe('Právo nabývat, držet a nosit zbraně je zaručeno za podmínek stanovených tímto zákonem.')
  })

  it('the quote states what the correct answer says (q1: "za podmínek stanovených …")', () => {
    const q = getQuestion(1)!
    expect(q[q.correct]).toMatch(/za podmínek stanovených zákonem/)
    expect(sourceFor(1)!.quote).toMatch(/za podmínek stanovených tímto zákonem/)
  })

  it('cites implementing regulations and the criminal code too, under the right heading', () => {
    const exam = sourceFor(562)!
    expect(exam.act).toMatch(/^Nařízení vlády č\. 238\/2025 Sb\./)
    expect(exam.heading).toBe('Z nařízení vlády')
    const defence = sourceFor(641)!
    expect(defence.act).toBe('Zákon č. 40/2009 Sb., trestní zákoník')
    expect(defence.label).toBe('§ 29 odst. 1')
    expect(defence.heading).toBe('Ze zákona')
  })

  it('returns nothing rather than a guess when no provision was matched with confidence', () => {
    const uncited = ALL_QUESTIONS.find((q) => !sourceFor(q.id))
    expect(uncited).toBeDefined()
    expect(sourceFor(999_999)).toBeUndefined()
  })

  it('cites only questions that exist, each with a non-empty quote', () => {
    expect(citedCount()).toBeGreaterThan(250)
    for (const q of ALL_QUESTIONS) {
      const s = sourceFor(q.id)
      if (s) expect(s.quote.length).toBeGreaterThan(10)
    }
  })
})
