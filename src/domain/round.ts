// An unfinished round, kept so the learner can pick it up again (Pavol's rule, 2026-11-01:
// "remember the user's solution to a question even if they dont complete the round").
// Every answer already lands in progress the moment it is given; this snapshot only remembers
// which questions the round held and where the learner stopped, so "Pokračovat" can serve the
// same questions again at the first unanswered one. Per device (localStorage), never synced.
import { getQuestion } from './questions'
import type { AnswerRecord, SessionState } from './session'
import type { Question } from './types'

/** Rounds that can be resumed. A mock exam cannot: it is timed, and leaving it ends it. */
export type RoundMode = 'lesson' | 'case'

export interface RoundSnapshot {
  mode: RoundMode
  /** The case, for mode 'case'. */
  caseSlug: string | null
  /** A foundation lesson stays one when resumed (bezpečnost first). */
  foundation: boolean
  /** The round's questions, in the order served. */
  ids: number[]
  records: AnswerRecord[]
  savedAt: number
}

/** One slot for the daily lesson, one per case. */
export type RoundKey = 'lesson' | `case:${string}`
export type Rounds = Partial<Record<RoundKey, RoundSnapshot>>

export function roundKey(mode: RoundMode, caseSlug: string | null): RoundKey {
  return mode === 'case' ? `case:${caseSlug ?? ''}` : 'lesson'
}

/** Snapshot a round in progress; null once nothing is answered (nothing to come back to). */
export function snapshotRound(
  session: SessionState,
  meta: { mode: RoundMode; caseSlug: string | null; foundation: boolean },
  now: number,
): RoundSnapshot | null {
  if (session.records.length === 0) return null
  return {
    mode: meta.mode,
    caseSlug: meta.mode === 'case' ? meta.caseSlug : null,
    foundation: meta.mode === 'lesson' && meta.foundation,
    ids: session.questions.map((q) => q.id),
    records: session.records,
    savedAt: now,
  }
}

/**
 * Rebuild the session: same questions, same order (options are never shuffled), the given
 * answers kept, positioned at the first unanswered question. If every question is answered
 * (left on the last feedback), it opens on the last one, so "Dokončit" finishes the round.
 * Null if the bank no longer has one of the questions.
 */
export function restoreSession(snap: RoundSnapshot): SessionState | null {
  const questions: Question[] = []
  for (const id of snap.ids) {
    const q = getQuestion(id)
    if (!q) return null
    questions.push(q)
  }
  if (questions.length === 0) return null
  const inRound = new Set(snap.ids)
  const records: AnswerRecord[] = []
  const chosen: SessionState['chosen'] = {}
  for (const r of snap.records) {
    if (!inRound.has(r.id) || chosen[r.id] !== undefined) continue
    const q = getQuestion(r.id)!
    records.push({ id: r.id, choice: r.choice, correct: r.choice === q.correct })
    chosen[r.id] = r.choice
  }
  const first = questions.findIndex((q) => chosen[q.id] === undefined)
  return { questions, records, chosen, index: first === -1 ? questions.length - 1 : first }
}

/** How far the round got: answered of total. */
export function roundProgress(snap: RoundSnapshot): { answered: number; total: number } {
  const ids = new Set(snap.ids)
  const answered = new Set(snap.records.filter((r) => ids.has(r.id)).map((r) => r.id)).size
  return { answered, total: snap.ids.length }
}

const MODES: RoundMode[] = ['lesson', 'case']
const CHOICES = ['a', 'b', 'c']

/** Validate rounds read back from storage; anything malformed is dropped. */
export function normalizeRounds(raw: unknown): Rounds {
  if (!raw || typeof raw !== 'object') return {}
  const out: Rounds = {}
  for (const [key, v] of Object.entries(raw as Record<string, unknown>)) {
    const s = v as Partial<RoundSnapshot> | null
    if (
      !s ||
      !MODES.includes(s.mode as RoundMode) ||
      roundKey(s.mode as RoundMode, s.caseSlug ?? null) !== key ||
      !Array.isArray(s.ids) ||
      !s.ids.every((id) => Number.isInteger(id)) ||
      !Array.isArray(s.records) ||
      !s.records.every(
        (r) => r && Number.isInteger(r.id) && CHOICES.includes(r.choice),
      )
    )
      continue
    out[key as RoundKey] = {
      mode: s.mode as RoundMode,
      caseSlug: s.caseSlug ?? null,
      foundation: s.foundation === true,
      ids: s.ids,
      records: s.records,
      savedAt: typeof s.savedAt === 'number' ? s.savedAt : 0,
    }
  }
  return out
}
