import { describe, it, expect } from 'vitest'
import {
  ALL_QUESTIONS,
  META,
  byCategory,
  getQuestion,
  questionsForGroup,
} from './questions'

describe('question dataset', () => {
  it('loads the full authoritative set (837 questions)', () => {
    expect(ALL_QUESTIONS).toHaveLength(837)
    expect(META.totalQuestions).toBe(837)
  })

  it('every question has a valid shape and a correct answer', () => {
    for (const q of ALL_QUESTIONS) {
      expect(typeof q.id).toBe('number')
      expect(q.q.length).toBeGreaterThan(0)
      expect(q.a.length).toBeGreaterThan(0)
      expect(q.b.length).toBeGreaterThan(0)
      expect(q.c.length).toBeGreaterThan(0)
      expect(['a', 'b', 'c']).toContain(q.correct)
      expect(Array.isArray(q.images)).toBe(true)
    }
  })

  it('contains no leftover extraction corruption', () => {
    const bad = /[�ƟơŌﬀ-ﬆ]/
    for (const q of ALL_QUESTIONS) {
      expect(bad.test(q.q + q.a + q.b + q.c), `q${q.id} corrupted`).toBe(false)
    }
  })

  it('includes the questions the legacy data was missing or wrong about', () => {
    // q108 was missing from the legacy jsx
    expect(getQuestion(108)).toBeDefined()
    // q717 answer key was wrong in legacy (A); official source marks B
    expect(getQuestion(717)?.correct).toBe('b')
  })

  it('groups categories by exam composition', () => {
    const counts = Object.fromEntries(
      META.categories.map((c) => [c.name, c.count]),
    )
    expect(counts['Zákon o zbraních']).toBe(561)
    expect(counts['Nauka o zbraních']).toBe(151)
    // legal group spans three categories
    const legal = questionsForGroup('pravni')
    expect(legal.length).toBe(561 + 48 + 39)
  })

  it('filters by category', () => {
    const nauka = byCategory('Nauka o zbraních')
    expect(nauka.length).toBe(151)
    expect(nauka.every((q) => q.cat === 'Nauka o zbraních')).toBe(true)
  })

  it('exam config reflects the real 2026 rules', () => {
    expect(META.exam.totalQuestions).toBe(60)
    expect(META.exam.passThreshold).toBe(57)
    expect(META.exam.timeLimitMinutes).toBe(80)
  })
})
