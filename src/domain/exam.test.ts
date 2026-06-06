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

const GROUP_OF: Record<string, ExamGroup> = {
  'Zákon o zbraních': 'pravni',
  'Prováděcí předpisy': 'pravni',
  'Jiné předpisy': 'pravni',
  'Nauka o zbraních': 'nauka',
  'Zdravotnické minimum': 'zdravotnicke',
}

describe('buildExam', () => {
  it('produces 60 questions in the official composition', () => {
    const exam = buildExam(makeRng(1))
    expect(exam).toHaveLength(60)
    const byGroup: Record<ExamGroup, number> = {
      pravni: 0,
      nauka: 0,
      zdravotnicke: 0,
    }
    for (const q of exam) byGroup[GROUP_OF[q.cat]]++
    expect(byGroup).toEqual({ pravni: 52, nauka: 5, zdravotnicke: 3 })
  })

  it('has no duplicate questions', () => {
    const exam = buildExam(makeRng(2))
    expect(new Set(exam.map((q) => q.id)).size).toBe(60)
  })

  it('is deterministic for a seed and varies across seeds', () => {
    const a = buildExam(makeRng(5)).map((q) => q.id)
    const b = buildExam(makeRng(5)).map((q) => q.id)
    const c = buildExam(makeRng(6)).map((q) => q.id)
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })

  it('exposes the official thresholds', () => {
    expect(EXAM.totalQuestions).toBe(60)
    expect(EXAM.passThreshold).toBe(57)
    expect(EXAM.timeLimitMinutes).toBe(80)
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
  it('passes at exactly the threshold (57/60)', () => {
    const exam = buildExam(makeRng(3))
    const result = evaluateExam(answerAll(exam, 57))
    expect(result.score).toBe(57)
    expect(result.total).toBe(60)
    expect(result.passed).toBe(true)
  })

  it('fails just below the threshold (56/60)', () => {
    const exam = buildExam(makeRng(3))
    const result = evaluateExam(answerAll(exam, 56))
    expect(result.score).toBe(56)
    expect(result.passed).toBe(false)
  })

  it('breaks the score down by category', () => {
    const exam = buildExam(makeRng(4))
    const result = evaluateExam(answerAll(exam, 60))
    const totalByCat = Object.values(result.byCategory).reduce(
      (n, c) => n + c.total,
      0,
    )
    expect(totalByCat).toBe(60)
  })
})
