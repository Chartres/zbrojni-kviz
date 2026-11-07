// Test D (2026-11-07): Otázka dne (question of the day). Opt-in. Everyone gets the same question
// on a given day, so a ranking among participants can follow if Pavol approves its data route
// (docs/PRD.md §5.4). One answer a day counts; a streak is kept on this device only, separate from
// the lesson streak, and never nags: a missed day just starts it again.
import rawOrder from '@data/daily-order.json'
import { getQuestion } from './questions'

/**
 * The order the bank is served in, frozen as data (data/daily-order.json, written once by
 * scripts/daily-order.mjs; new ids appended): day n gets the n-th question, so a change to the bank
 * never moves anyone's question of the day, and nothing repeats for 837 days.
 */
const ORDER = (rawOrder as { order: number[] }).order.filter((id) => getQuestion(id) !== undefined)
const EPOCH = Date.UTC(2026, 10, 7)
const DAY_MS = 86_400_000
const KEEP_DAYS = 31

function dayNumber(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / DAY_MS)
}

export function dailyQuestionId(day: string): number {
  const n = dayNumber(day)
  return ORDER[((n % ORDER.length) + ORDER.length) % ORDER.length]
}

export interface DailyState {
  optedIn: boolean
  /** Day (YYYY-MM-DD) → 1 correct / 0 wrong, the first answer of that day. Recent days only. */
  days: Record<string, 0 | 1>
  current: number
  best: number
  /** Last day answered. */
  last: string
}

export function emptyDaily(): DailyState {
  return { optedIn: false, days: {}, current: 0, best: 0, last: '' }
}

export function answeredOn(s: DailyState, day: string): boolean {
  return s.days[day] !== undefined
}

export function recordDaily(s: DailyState, day: string, correct: boolean): DailyState {
  if (answeredOn(s, day)) return s
  const current = s.last && dayNumber(day) - dayNumber(s.last) === 1 ? s.current + 1 : 1
  const days = { ...s.days, [day]: (correct ? 1 : 0) as 0 | 1 }
  const keep = Object.keys(days).sort().slice(-KEEP_DAYS)
  return {
    ...s,
    days: Object.fromEntries(keep.map((k) => [k, days[k]])),
    current,
    best: Math.max(s.best, current),
    last: day,
  }
}

/** The streak to show today: alive if answered today or yesterday. */
export function liveDailyStreak(s: DailyState, today: string): number {
  if (!s.last) return 0
  const gap = dayNumber(today) - dayNumber(s.last)
  return gap === 0 || gap === 1 ? s.current : 0
}

/** Days answered, and answered correctly, in the 7 days ending today. */
export function recentDays(s: DailyState, today: string): { answered: number; correct: number } {
  const t = dayNumber(today)
  let answered = 0
  let correct = 0
  for (const [day, ok] of Object.entries(s.days)) {
    const gap = t - dayNumber(day)
    if (gap >= 0 && gap < 7) {
      answered++
      correct += ok
    }
  }
  return { answered, correct }
}

export function normalizeDaily(raw: unknown): DailyState {
  const v = raw as Partial<DailyState> | null
  if (!v || typeof v !== 'object' || typeof v.optedIn !== 'boolean' || !v.days || typeof v.days !== 'object') {
    return emptyDaily()
  }
  const days: Record<string, 0 | 1> = {}
  for (const [k, x] of Object.entries(v.days)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && (x === 0 || x === 1)) days[k] = x
  }
  return {
    optedIn: v.optedIn,
    days,
    current: Number.isFinite(v.current) ? Number(v.current) : 0,
    best: Number.isFinite(v.best) ? Number(v.best) : 0,
    last: typeof v.last === 'string' ? v.last : '',
  }
}
