import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import { buildExam, evaluateExam, EXAM } from './exam'
import {
  createSession,
  answerCurrent,
  advance,
  currentQuestion,
  type SessionState,
} from './session'
import type { ExamGroup } from './types'
import { META, examGroupOf } from './questions'

// Zákon č. 90/2024 Sb. § 20 odst. 3 písm. a): 30 otázek, nejdéle 40 minut, alespoň 26 správně
// (28 u rozšířeného zbrojního oprávnění). NV č. 238/2025 Sb. § 12 odst. 2: 17 právní předpisy,
// 5 nauka o zbraních a střelivu, 5 zásady bezpečného nakládání, 3 zdravotnické minimum.
describe('buildExam', () => {
  it('produces 30 questions in the composition of NV 238/2025 § 12 (17 + 5 + 5 + 3)', () => {
    const exam = buildExam(makeRng(1))
    expect(exam).toHaveLength(30)
    const byGroup: Record<ExamGroup, number> = { pravni: 0, nauka: 0, bezpecnost: 0, zdravotnicke: 0 }
    for (const q of exam) byGroup[examGroupOf(q)]++
    expect(byGroup).toEqual({ pravni: 17, nauka: 5, bezpecnost: 5, zdravotnicke: 3 })
  })

  it('draws the safe-handling part from the handling rules and safety-principle questions', () => {
    for (let seed = 1; seed <= 50; seed++) {
      for (const q of buildExam(makeRng(seed))) {
        if (examGroupOf(q) !== 'bezpecnost') continue
        expect((q.id >= 562 && q.id <= 596) || (q.id >= 784 && q.id <= 799)).toBe(true)
      }
    }
  })

  it('has no duplicate questions', () => {
    const exam = buildExam(makeRng(2))
    expect(new Set(exam.map((q) => q.id)).size).toBe(30)
  })

  it('never contains both questions of a known duplicate pair', () => {
    for (let seed = 1; seed <= 2000; seed++) {
      const ids = new Set(buildExam(makeRng(seed)).map((q) => q.id))
      for (const [x, y] of META.duplicatePairs) {
        expect(ids.has(x) && ids.has(y), `seed ${seed}: ${x}+${y}`).toBe(false)
      }
    }
  })

  it('is deterministic for a seed and varies across seeds', () => {
    const a = buildExam(makeRng(5)).map((q) => q.id)
    const b = buildExam(makeRng(5)).map((q) => q.id)
    const c = buildExam(makeRng(6)).map((q) => q.id)
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })

  it('exposes the thresholds of zákon 90/2024 § 20 odst. 3 písm. a)', () => {
    expect(EXAM.totalQuestions).toBe(30)
    expect(EXAM.timeLimitMinutes).toBe(40)
    expect(EXAM.passThreshold).toBe(26)
    expect(EXAM.passThresholdExtended).toBe(28)
  })
})

function answerAll(exam: ReturnType<typeof buildExam>, correctCount: number) {
  let s: SessionState = createSession(exam)
  let i = 0
  while (currentQuestion(s)) {
    const cur = currentQuestion(s)!
    const wrong = (['a', 'b', 'c'] as const).find((o) => o !== cur.correct)!
    s = answerCurrent(s, i < correctCount ? cur.correct : wrong)
    s = advance(s)
    i++
  }
  return s
}

describe('evaluateExam', () => {
  it('passes the general permit at exactly 26/30, not the extended one', () => {
    const result = evaluateExam(answerAll(buildExam(makeRng(3)), 26))
    expect(result.score).toBe(26)
    expect(result.total).toBe(30)
    expect(result.passed).toBe(true)
    expect(result.passedExtended).toBe(false)
  })

  it('fails just below the threshold (25/30)', () => {
    const result = evaluateExam(answerAll(buildExam(makeRng(3)), 25))
    expect(result.passed).toBe(false)
    expect(result.passedExtended).toBe(false)
  })

  it('passes the extended permit at 28/30', () => {
    const result = evaluateExam(answerAll(buildExam(makeRng(3)), 28))
    expect(result.passed).toBe(true)
    expect(result.passedExtended).toBe(true)
    expect(result.passThresholdExtended).toBe(28)
  })

  it('breaks the score down by category', () => {
    const result = evaluateExam(answerAll(buildExam(makeRng(4)), 30))
    const totalByCat = Object.values(result.byCategory).reduce((n, c) => n + c.total, 0)
    expect(totalByCat).toBe(30)
  })

  it('breaks the score down by the four parts of the official test', () => {
    const result = evaluateExam(answerAll(buildExam(makeRng(4)), 30))
    expect(result.byPart.map((p) => [p.group, p.total])).toEqual([
      ['pravni', 17],
      ['nauka', 5],
      ['bezpecnost', 5],
      ['zdravotnicke', 3],
    ])
    expect(result.byPart.every((p) => p.correct === p.total)).toBe(true)
  })
})
