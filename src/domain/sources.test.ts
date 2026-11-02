import { describe, it, expect } from 'vitest'
import { sourceFor, citedCount } from './sources'
import { ALL_QUESTIONS, getQuestion } from './questions'
import law from '@data/law/2024-90.json'
import overrides from '@data/law/reviewed-overrides.json'

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

  it('q323 (who may carry a registered gun to protect life, health or property) cites § 80 odst. 2', () => {
    // The matcher picked § 90 odst. 1 (people working for a licence holder); a reviewer set the
    // provision the question tests: only an extended-licence holder may carry, outside § 81.
    const s = sourceFor(323)!
    expect(s.label).toBe('§ 80 odst. 2')
    expect(s.url).toBe('https://www.zakonyprolidi.cz/cs/2024-90#p80-2')
    const unit = (law as { units: { id: string; text: string }[] }).units.find((u) => u.id === 'p80-2')!
    expect(s.quote).toBe(unit.text)
    expect(s.quote).toMatch(/pouze držitel rozšířeného zbrojního oprávnění/)
  })

  it('every reviewed override is a real provision, quoted verbatim', () => {
    const units = new Map((law as { units: { id: string; text: string }[] }).units.map((u) => [u.id, u.text]))
    for (const [id, o] of Object.entries(overrides as Record<string, { act: string; unit: string }>)) {
      expect(o.act).toBe('2024-90')
      expect(units.has(o.unit)).toBe(true)
      expect(sourceFor(Number(id))!.quote).toContain(units.get(o.unit)!)
    }
  })
})
