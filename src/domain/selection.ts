import type { CategoryName, Question } from './types'
import { ALL_QUESTIONS, getQuestion } from './questions'
import { sample, shuffle, type Rng } from './rng'
import { dueForReview, isMastered, statFor, type ProgressData } from './progress'

export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .toLowerCase()
}

export interface FilterOptions {
  categories?: Set<CategoryName>
  search?: string
}

export function filterQuestions(opts: FilterOptions): Question[] {
  const term = opts.search ? normalizeForSearch(opts.search.trim()) : ''
  return ALL_QUESTIONS.filter((q) => {
    if (opts.categories && opts.categories.size > 0 && !opts.categories.has(q.cat))
      return false
    if (term) {
      const hay = normalizeForSearch(q.q + ' ' + q.a + ' ' + q.b + ' ' + q.c)
      if (!hay.includes(term)) return false
    }
    return true
  })
}

export function buildPractice(opts: FilterOptions, rng: Rng): Question[] {
  return shuffle(filterQuestions(opts), rng)
}

export function reviewQuestions(p: ProgressData, now = 0): Question[] {
  return dueForReview(p, now)
    .map((id) => getQuestion(id))
    .filter((q): q is Question => q !== undefined)
}

export function bookmarkedQuestions(p: ProgressData): Question[] {
  return p.bookmarks
    .map((id) => getQuestion(id))
    .filter((q): q is Question => q !== undefined)
}

/** A category only qualifies as "weak" once it has this many distinct seen questions. */
const MIN_SEEN_FOR_WEAK_CATEGORY = 3
export const WEAK_DRILL_SIZE = 12

export interface WeakCategory {
  cat: CategoryName
  /** Distinct questions in this category the learner has attempted. */
  seenQuestions: number
  /** Accuracy (0..1) over all attempts on this category's seen questions. */
  accuracy: number
}

/**
 * The 1-3 worst-performing categories (lowest accuracy first), each with
 * enough attempt history (>= MIN_SEEN_FOR_WEAK_CATEGORY seen questions) to be
 * meaningful, and excluding categories with no errors at all.
 */
export function weakCategories(
  questions: Question[],
  p: ProgressData,
): WeakCategory[] {
  const byCat = new Map<
    CategoryName,
    { seenQuestions: number; correct: number; attempts: number }
  >()
  for (const q of questions) {
    const s = statFor(p, q.id)
    if (s.seen === 0) continue
    const entry = byCat.get(q.cat) ?? { seenQuestions: 0, correct: 0, attempts: 0 }
    entry.seenQuestions++
    entry.correct += s.correct
    entry.attempts += s.seen
    byCat.set(q.cat, entry)
  }

  const qualifying: WeakCategory[] = []
  for (const [cat, entry] of byCat) {
    if (entry.seenQuestions < MIN_SEEN_FOR_WEAK_CATEGORY) continue
    const accuracy = entry.attempts === 0 ? 1 : entry.correct / entry.attempts
    if (accuracy >= 1) continue // no errors here — not "weak"
    qualifying.push({ cat, seenQuestions: entry.seenQuestions, accuracy })
  }
  qualifying.sort((a, b) => a.accuracy - b.accuracy)
  return qualifying.slice(0, 3)
}

/**
 * A weak-area drill: pulls from the 1-3 worst-performing categories,
 * prioritising currently-wrong questions, then seen-but-not-yet-mastered,
 * then least-recently-seen mastered ones, topping up with unseen questions
 * from those same categories if still short of `size`. Returns [] when no
 * category qualifies as weak.
 */
export function buildWeakDrill(
  questions: Question[],
  p: ProgressData,
  rng: Rng,
  size = WEAK_DRILL_SIZE,
): Question[] {
  const weak = weakCategories(questions, p)
  if (weak.length === 0) return []
  const cats = new Set(weak.map((w) => w.cat))
  const pool = questions.filter((q) => cats.has(q.cat))

  const currentlyWrong: Question[] = []
  const notYetMastered: Question[] = []
  const masteredSeen: Question[] = []
  const unseen: Question[] = []

  for (const q of pool) {
    const s = statFor(p, q.id)
    if (s.seen === 0) unseen.push(q)
    else if (s.streak === 0) currentlyWrong.push(q)
    else if (!isMastered(s)) notYetMastered.push(q)
    else masteredSeen.push(q)
  }

  const byLeastRecentlySeen = (a: Question, b: Question) =>
    statFor(p, a.id).lastSeen - statFor(p, b.id).lastSeen

  const ordered = [
    ...currentlyWrong.sort(byLeastRecentlySeen),
    ...notYetMastered.sort(byLeastRecentlySeen),
    ...masteredSeen.sort(byLeastRecentlySeen),
  ]
  if (ordered.length >= size) return ordered.slice(0, size)

  return [...ordered, ...sample(unseen, size - ordered.length, rng)]
}
