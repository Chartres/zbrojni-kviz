import type { CategoryName, Question } from './types'

/** Consecutive correct answers required to consider a question "mastered". */
export const MASTERY_STREAK = 2

export interface QuestionStat {
  seen: number
  correct: number
  streak: number
  lastSeen: number
  lastCorrect: boolean
}

export interface Streak {
  current: number
  best: number
  /** ISO date (YYYY-MM-DD) of the last completed lesson. */
  lastDate: string
}

/** A single completed (or timed-out) exam attempt, kept for history. */
export interface ExamAttempt {
  at: number
  score: number
  total: number
  passed: boolean
  byCategory: Record<string, { correct: number; total: number }>
}

/**
 * The best attempt by share of correct answers. Attempts before the § 20 fix (#10) were out of
 * 60 and current ones out of 30, so raw scores don't compare. Ties go to the newer attempt.
 */
export function bestExamAttempt(attempts: ExamAttempt[]): ExamAttempt | null {
  let best: ExamAttempt | null = null
  for (const a of attempts) {
    if (!(a.total > 0)) continue // also skips a malformed row with no total (synced data)
    const d = best ? a.score * best.total - best.score * a.total : 1
    if (d > 0 || (d === 0 && a.at > best!.at)) best = a
  }
  return best
}

/** Most exam attempts we keep per user — older ones roll off. */
export const MAX_EXAM_ATTEMPTS = 50

export interface ProgressData {
  version: number
  stats: Record<number, QuestionStat>
  bookmarks: number[]
  /** Question id → time of its last bookmark toggle, so a merge can tell a removal from a never-added. Added later; normalizeProgress fills it. */
  bookmarkEdits: Record<number, number>
  streak: Streak
  /** Added later (PROGRESS_VERSION stays 1); normalizeProgress fills it on older snapshots. */
  examAttempts: ExamAttempt[]
}

export const PROGRESS_VERSION = 1

export function emptyStreak(): Streak {
  return { current: 0, best: 0, lastDate: '' }
}

export function emptyProgress(): ProgressData {
  return {
    version: PROGRESS_VERSION,
    stats: {},
    bookmarks: [],
    bookmarkEdits: {},
    streak: emptyStreak(),
    examAttempts: [],
  }
}

/**
 * Normalise a persisted snapshot (localStorage or cloud) into full ProgressData,
 * filling in fields added after it was written. Returns null when the snapshot is
 * absent or from a different PROGRESS_VERSION — callers decide the fallback.
 */
export function normalizeProgress(
  stored: Partial<ProgressData> | null | undefined,
): ProgressData | null {
  if (!stored || stored.version !== PROGRESS_VERSION) return null
  return {
    version: PROGRESS_VERSION,
    stats: stored.stats ?? {},
    bookmarks: Array.isArray(stored.bookmarks) ? stored.bookmarks : [],
    bookmarkEdits: stored.bookmarkEdits ?? {},
    streak: stored.streak ?? emptyStreak(),
    examAttempts: stored.examAttempts ?? [],
  }
}

/**
 * Record a completed exam attempt, newest-first (index 0 = most recent),
 * capped at MAX_EXAM_ATTEMPTS.
 */
export function recordExamAttempt(
  p: ProgressData,
  attempt: ExamAttempt,
): ProgressData {
  const examAttempts = [attempt, ...p.examAttempts].slice(
    0,
    MAX_EXAM_ATTEMPTS,
  )
  return { ...p, examAttempts }
}

/** True if `today` (YYYY-MM-DD) is exactly the day after `prev`. */
function isNextDay(prev: string, today: string): boolean {
  if (!prev) return false
  const [py, pm, pd] = prev.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const a = Date.UTC(py, pm - 1, pd)
  const b = Date.UTC(ty, tm - 1, td)
  return b - a === 86_400_000
}

/** The streak to display on `today`: still alive the day after the last lesson, 0 once a day is missed. */
export function liveStreak(s: Streak, today: string): number {
  return s.lastDate === today || isNextDay(s.lastDate, today) ? s.current : 0
}

/** Record that the learner completed a lesson on `today` (YYYY-MM-DD). */
export function recordLessonComplete(
  p: ProgressData,
  today: string,
): ProgressData {
  const s = p.streak
  if (s.lastDate === today) return p // already counted today
  const current = isNextDay(s.lastDate, today) ? s.current + 1 : 1
  return {
    ...p,
    streak: { current, best: Math.max(s.best, current), lastDate: today },
  }
}

export function statFor(p: ProgressData, id: number): QuestionStat {
  return (
    p.stats[id] ?? {
      seen: 0,
      correct: 0,
      streak: 0,
      lastSeen: 0,
      lastCorrect: false,
    }
  )
}

export function recordAnswer(
  p: ProgressData,
  id: number,
  correct: boolean,
  now: number,
): ProgressData {
  const prev = statFor(p, id)
  const next: QuestionStat = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak: correct ? prev.streak + 1 : 0,
    lastSeen: now,
    lastCorrect: correct,
  }
  return {
    ...p,
    stats: { ...p.stats, [id]: next },
  }
}

export function isMastered(s: QuestionStat): boolean {
  return s.streak >= MASTERY_STREAK
}

export function masteredCount(p: ProgressData): number {
  return Object.values(p.stats).filter(isMastered).length
}

export function answeredCount(p: ProgressData): number {
  return Object.values(p.stats).filter((s) => s.seen > 0).length
}

export function accuracy(p: ProgressData): number {
  let seen = 0
  let correct = 0
  for (const s of Object.values(p.stats)) {
    seen += s.seen
    correct += s.correct
  }
  return seen === 0 ? 0 : correct / seen
}

export function toggleBookmark(
  p: ProgressData,
  id: number,
  now: number = Date.now(),
): ProgressData {
  const set = new Set(p.bookmarks)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  return { ...p, bookmarks: [...set], bookmarkEdits: { ...p.bookmarkEdits, [id]: now } }
}

export function isBookmarked(p: ProgressData, id: number): boolean {
  return p.bookmarks.includes(id)
}

/** Questions seen at least once but not yet mastered. */
export function needsReviewIds(p: ProgressData): number[] {
  return Object.entries(p.stats)
    .filter(([, s]) => s.seen > 0 && !isMastered(s))
    .map(([id]) => Number(id))
}

/**
 * Review queue ordered by urgency: most-recently-wrong first, then
 * least-recently-seen. This is the lightweight spaced-repetition signal —
 * drill the weak spots (Montessori "isolation of difficulty").
 */
export function dueForReview(p: ProgressData): number[] {
  return needsReviewIds(p).sort((a, b) => {
    const sa = statFor(p, a)
    const sb = statFor(p, b)
    // wrong (lastCorrect false) sorts before correct-but-unmastered
    if (sa.lastCorrect !== sb.lastCorrect) return sa.lastCorrect ? 1 : -1
    // older (smaller lastSeen) first
    return sa.lastSeen - sb.lastSeen
  })
}

export interface CategorySummary {
  total: number
  seen: number
  mastered: number
}

export interface ProgressSummary {
  total: number
  answered: number
  mastered: number
  accuracy: number
  byCategory: Partial<Record<CategoryName, CategorySummary>>
}

export function summary(
  p: ProgressData,
  allQuestions: Question[],
): ProgressSummary {
  const byCategory: Partial<Record<CategoryName, CategorySummary>> = {}
  for (const q of allQuestions) {
    const c = (byCategory[q.cat] ??= { total: 0, seen: 0, mastered: 0 })
    c.total++
    const s = p.stats[q.id]
    if (s && s.seen > 0) {
      c.seen++
      if (isMastered(s)) c.mastered++
    }
  }
  return {
    total: allQuestions.length,
    answered: answeredCount(p),
    mastered: masteredCount(p),
    accuracy: accuracy(p),
    byCategory,
  }
}

/** Merge two progress snapshots: last-write-wins per question and per bookmark toggle. */
export function mergeProgress(
  a: ProgressData,
  b: ProgressData,
): ProgressData {
  const stats: Record<number, QuestionStat> = { ...a.stats }
  for (const [idStr, s] of Object.entries(b.stats)) {
    const id = Number(idStr)
    const existing = stats[id]
    if (!existing || s.lastSeen >= existing.lastSeen) stats[id] = s
  }
  const sa = a.streak
  const sb = b.streak
  const [older, latest] = sb.lastDate >= sa.lastDate ? [sa, sb] : [sb, sa]
  // Lessons on two devices on the same or consecutive days are one streak:
  // a fresh 1-day streak must not clobber a 40-day one from the day before.
  const current =
    older.lastDate === latest.lastDate
      ? Math.max(older.current, latest.current)
      : isNextDay(older.lastDate, latest.lastDate)
        ? Math.max(latest.current, older.current + 1)
        : latest.current

  // Union by `at` (dedupe same-instant duplicates), newest-first, capped.
  const attemptsByAt = new Map<number, ExamAttempt>()
  for (const attempt of [...a.examAttempts, ...b.examAttempts]) {
    attemptsByAt.set(attempt.at, attempt)
  }
  const examAttempts = [...attemptsByAt.values()]
    .sort((x, y) => y.at - x.at)
    .slice(0, MAX_EXAM_ATTEMPTS)

  // Per bookmark, the side that toggled it last wins; a tie (e.g. no edit times
  // on legacy data) keeps it if either side has it.
  const ea = a.bookmarkEdits
  const eb = b.bookmarkEdits
  const bookmarkEdits: Record<number, number> = { ...ea }
  for (const [id, at] of Object.entries(eb)) {
    bookmarkEdits[Number(id)] = Math.max(at, ea[Number(id)] ?? 0)
  }
  const bookmarks = [...new Set([...a.bookmarks, ...b.bookmarks])]
    .filter((id) => {
      const ta = ea[id] ?? 0
      const tb = eb[id] ?? 0
      if (ta === tb) return true
      return (ta > tb ? a : b).bookmarks.includes(id)
    })
    .sort((x, y) => x - y)

  return {
    version: PROGRESS_VERSION,
    stats,
    bookmarks,
    bookmarkEdits,
    streak: { current, best: Math.max(sa.best, sb.best, current), lastDate: latest.lastDate },
    examAttempts,
  }
}
