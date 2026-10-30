import type { Question } from './types'
import { META, questionsForGroup, getQuestion, examGroupOf } from './questions'
import { EXAM } from './exam'
import { shuffle, type Rng } from './rng'
import { answeredCount, dueForReview, isMastered, statFor, type ProgressData } from './progress'
import type { ExamGroup } from './types'

/** A daily lesson is short and always finishable — Duolingo-style. */
export const LESSON_SIZE = 12
/** At most this fraction of a lesson is review of weak spots. */
const REVIEW_FRACTION = 0.4

/**
 * Bezpečnost first (Cooper's rules, Comenius: from the known to the unknown). Until a learner
 * has answered this many questions (about three lessons), new material leans on safe handling
 * and first aid instead of the exam's legal-heavy mix.
 */
export const FOUNDATION_ANSWERS = 3 * LESSON_SIZE
/** Fresh-material weights in a foundation lesson, in the order the lesson is served. */
const FOUNDATION_MIX: { group: ExamGroup; weight: number }[] = [
  { group: 'bezpecnost', weight: 5 },
  { group: 'zdravotnicke', weight: 3 },
  { group: 'nauka', weight: 1 },
  { group: 'pravni', weight: 3 },
]
const FOUNDATION_WEIGHT = FOUNDATION_MIX.reduce((n, p) => n + p.weight, 0)

export function isFoundationPhase(progress: ProgressData): boolean {
  return answeredCount(progress) < FOUNDATION_ANSWERS
}

// Verbatim duplicates (META.duplicatePairs), both directions: taking one blocks its twin.
const TWIN_OF = new Map(META.duplicatePairs.flatMap(([x, y]) => [[x, y], [y, x]] as const))

/**
 * Assemble a bite-sized, personalised lesson:
 *  - up to ~40 % review of due weak spots (spaced repetition), then
 *  - fresh, unseen questions weighted to the real exam composition
 *    (legal-heavy), falling back to seen-but-unmastered if a group runs out.
 * Always returns exactly LESSON_SIZE distinct questions (shuffled).
 */
export function buildLesson(
  progress: ProgressData,
  rng: Rng,
  size = LESSON_SIZE,
): Question[] {
  const used = new Set<number>()
  const take = (q: Question | undefined) => {
    if (q && !used.has(q.id)) {
      used.add(q.id)
      const twin = TWIN_OF.get(q.id)
      if (twin !== undefined) used.add(twin)
      return true
    }
    return false
  }

  // 1) Review: due weak-spots, capped.
  const reviewCap = Math.floor(size * REVIEW_FRACTION)
  const review: Question[] = []
  for (const id of dueForReview(progress)) {
    if (review.length >= reviewCap) break
    const q = getQuestion(id)
    if (q && take(q)) review.push(q)
  }

  // 2) New material: a foundation lesson leans on safe handling and first aid; after that,
  //    the exam composition.
  const foundation = isFoundationPhase(progress)
  const newCount = size - review.length
  const fresh: Question[] = []
  const mix = foundation
    ? FOUNDATION_MIX.map((p) => ({ group: p.group, share: p.weight / FOUNDATION_WEIGHT }))
    : EXAM.composition.map((p) => ({ group: p.group, share: p.count / EXAM.totalQuestions }))
  for (const part of mix) {
    const want = Math.round(newCount * part.share)
    const pool = questionsForGroup(part.group).filter(
      (q) => !used.has(q.id) && statFor(progress, q.id).seen === 0,
    )
    // Walk the shuffled pool rather than taking a fixed sample: a duplicate twin that take()
    // rejects is replaced from the same group, so the mix holds.
    let got = 0
    for (const q of shuffle(pool, rng)) {
      if (got >= want || fresh.length >= newCount) break
      if (take(q)) {
        fresh.push(q)
        got++
      }
    }
  }

  // 3) Top up to size: any remaining unseen, then seen-but-unmastered, then
  //    mastered (refresher) so a learner who mastered everything still gets a full lesson.
  if (review.length + fresh.length < size) {
    const all = EXAM.composition.flatMap((p) => questionsForGroup(p.group))
    const unseen = all.filter((q) => !used.has(q.id) && statFor(progress, q.id).seen === 0)
    const unmastered = all.filter(
      (q) => !used.has(q.id) && !isMastered(statFor(progress, q.id)),
    )
    for (const q of [...shuffle(unseen, rng), ...shuffle(unmastered, rng), ...shuffle(all, rng)]) {
      if (review.length + fresh.length >= size) break
      if (take(q)) fresh.push(q)
    }
  }

  // A foundation lesson is served in mix order, safe handling first, with its review at the end.
  if (foundation) {
    const rank = new Map(FOUNDATION_MIX.map((p, i) => [p.group, i]))
    const ordered = fresh
      .map((q, i) => ({ q, i }))
      .sort((x, y) => rank.get(examGroupOf(x.q))! - rank.get(examGroupOf(y.q))! || x.i - y.i)
      .map((x) => x.q)
    return [...ordered, ...review].slice(0, size)
  }
  return shuffle([...review, ...fresh], rng).slice(0, size)
}
