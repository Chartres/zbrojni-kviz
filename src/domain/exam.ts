import type { CategoryName, ExamConfig, ExamGroup, Question } from './types'
import { META, examGroupOf, questionsForGroup } from './questions'
import { sample, shuffle, type Rng } from './rng'
import { score as sessionScore, type SessionState } from './session'

export const EXAM: ExamConfig = META.exam

// The source set repeats a few questions verbatim (META.duplicatePairs); draw
// only the first of each pair so an exam never asks the same question twice.
const TWINS = new Set(META.duplicatePairs.map(([, twin]) => twin))

/**
 * Assemble a mock exam in the official composition (NV 238/2025 § 12:
 * 17 legal + 5 weapons science + 5 safe handling + 3 first aid = 30), then shuffle the order.
 */
export function buildExam(rng: Rng): Question[] {
  const picked: Question[] = []
  for (const part of EXAM.composition) {
    const pool = questionsForGroup(part.group).filter((q) => !TWINS.has(q.id))
    picked.push(...sample(pool, part.count, rng))
  }
  return shuffle(picked, rng)
}

export interface CategoryBreakdown {
  correct: number
  total: number
}

export interface PartBreakdown extends CategoryBreakdown {
  group: ExamGroup
  label: string
}

export interface ExamResult {
  score: number
  total: number
  /** Passed for the general zbrojní oprávnění. */
  passed: boolean
  passThreshold: number
  /** Passed for the rozšířené zbrojní oprávnění. */
  passedExtended: boolean
  passThresholdExtended: number
  byCategory: Partial<Record<CategoryName, CategoryBreakdown>>
  /** The four parts of the official test, in the order the regulation lists them. */
  byPart: PartBreakdown[]
}

export function evaluateExam(s: SessionState): ExamResult {
  const total = s.questions.length
  const score = sessionScore(s)
  const byCategory: Partial<Record<CategoryName, CategoryBreakdown>> = {}
  const byPart: PartBreakdown[] = EXAM.composition.map((p) => ({
    group: p.group,
    label: p.label,
    correct: 0,
    total: 0,
  }))
  for (const q of s.questions) {
    const ok = s.chosen[q.id] === q.correct
    const b = (byCategory[q.cat] ??= { correct: 0, total: 0 })
    const part = byPart.find((p) => p.group === examGroupOf(q))!
    b.total++
    part.total++
    if (ok) {
      b.correct++
      part.correct++
    }
  }
  return {
    score,
    total,
    passed: score >= EXAM.passThreshold,
    passThreshold: EXAM.passThreshold,
    passedExtended: score >= EXAM.passThresholdExtended,
    passThresholdExtended: EXAM.passThresholdExtended,
    byCategory,
    byPart,
  }
}
