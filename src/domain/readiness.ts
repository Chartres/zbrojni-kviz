// Readiness (Bloom, mastery learning): the chance of passing the real test, estimated from
// what the learner has actually answered in each part of it, and the part that costs the
// most points. Driven by META.exam (composition + both thresholds), so any bank ports it.
import { EXAM } from './exam'
import { questionsForGroup } from './questions'
import { isMastered, statFor, type ProgressData, type QuestionStat } from './progress'
import type { ExamGroup } from './types'

/** No estimate until every part has at least this share of its questions answered. */
export const MIN_COVERAGE = 0.3
/** An unseen question is a coin flip — said openly in the UI, not hidden in the number. */
export const UNSEEN = 0.5
const MASTERED = 0.95

/** Chance of answering this question right next time, from the learner's own history. */
export function questionChance(s: QuestionStat): number {
  if (s.seen === 0) return UNSEEN
  if (isMastered(s)) return MASTERED
  return (s.correct + 1) / (s.seen + 2) // Laplace: 1 right of 1 → 2/3, 0 of 1 → 1/3
}

/** Exact distribution of the total score over independent binomial parts. */
export function scoreDistribution(parts: { n: number; p: number }[]): number[] {
  let dist = [1]
  for (const { n, p } of parts) {
    for (let k = 0; k < n; k++) {
      const next = new Array<number>(dist.length + 1).fill(0)
      dist.forEach((x, i) => {
        next[i] += x * (1 - p)
        next[i + 1] += x * p
      })
      dist = next
    }
  }
  return dist
}

export interface PartReadiness {
  group: ExamGroup
  label: string
  /** Questions of this part in the real test. */
  count: number
  /** Estimated chance per question. */
  chance: number
  /** Share of the part's pool answered at least once. */
  coverage: number
  /** Expected points lost in this part. */
  expectedLost: number
}

export interface Readiness {
  enoughData: boolean
  pass: number
  passExtended: number
  parts: PartReadiness[]
  weakest: ExamGroup
}

export function readiness(progress: ProgressData): Readiness {
  const parts: PartReadiness[] = EXAM.composition.map((part) => {
    const pool = questionsForGroup(part.group)
    const stats = pool.map((q) => statFor(progress, q.id))
    const chance = stats.reduce((s, st) => s + questionChance(st), 0) / pool.length
    const coverage = stats.filter((st) => st.seen > 0).length / pool.length
    return {
      group: part.group,
      label: part.label,
      count: part.count,
      chance,
      coverage,
      expectedLost: part.count * (1 - chance),
    }
  })
  const dist = scoreDistribution(parts.map((p) => ({ n: p.count, p: p.chance })))
  const atLeast = (k: number) => dist.slice(k).reduce((a, b) => a + b, 0)
  return {
    enoughData: parts.every((p) => p.coverage >= MIN_COVERAGE),
    pass: atLeast(EXAM.passThreshold),
    passExtended: atLeast(EXAM.passThresholdExtended),
    parts,
    weakest: parts.reduce((w, p) => (p.expectedLost > w.expectedLost ? p : w)).group,
  }
}
