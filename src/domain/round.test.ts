import { describe, it, expect } from 'vitest'
import { normalizeRounds, restoreSession, roundKey, roundProgress, snapshotRound } from './round'
import { answerCurrent, advance, createSession, currentQuestion, type SessionState } from './session'
import { getQuestion } from './questions'
import type { Question } from './types'

const qs = [562, 563, 564, 800, 801].map((id) => getQuestion(id)!) as Question[]
const meta = { mode: 'lesson' as const, caseSlug: null, foundation: true }

function answered(n: number): SessionState {
  let s = createSession(qs)
  for (let i = 0; i < n; i++) {
    s = answerCurrent(s, currentQuestion(s)!.correct)
    s = advance(s)
  }
  return s
}

describe('round snapshot', () => {
  it('nothing answered: nothing to come back to', () => {
    expect(snapshotRound(createSession(qs), meta, 1)).toBeNull()
  })

  it('restores the same questions in the same order at the first unanswered one', () => {
    const snap = snapshotRound(answered(3), meta, 5)!
    expect(snap.ids).toEqual(qs.map((q) => q.id))
    expect(snap.foundation).toBe(true)
    const s = restoreSession(snap)!
    expect(s.questions.map((q) => q.id)).toEqual(qs.map((q) => q.id))
    expect(s.index).toBe(3)
    expect(Object.keys(s.chosen).map(Number)).toEqual(qs.slice(0, 3).map((q) => q.id))
    expect(s.records.every((r) => r.correct)).toBe(true)
    expect(roundProgress(snap)).toEqual({ answered: 3, total: 5 })
  })

  it('left on the feedback of an answered question: resumes at the next unanswered one', () => {
    let s = answered(2)
    s = answerCurrent(s, currentQuestion(s)!.correct) // answered q3, did not press Další
    expect(restoreSession(snapshotRound(s, meta, 1)!)!.index).toBe(3)
  })

  it('all answered but not finished: opens on the last question so Dokončit finishes it', () => {
    let s = answered(4)
    s = answerCurrent(s, currentQuestion(s)!.correct)
    expect(restoreSession(snapshotRound(s, meta, 1)!)!.index).toBe(4)
  })

  it('re-derives correctness from the bank, and gives up on a question the bank lost', () => {
    const snap = snapshotRound(answered(1), meta, 1)!
    const tampered = { ...snap, records: [{ ...snap.records[0], correct: false }] }
    expect(restoreSession(tampered)!.records[0].correct).toBe(true)
    expect(restoreSession({ ...snap, ids: [...snap.ids, 999999] })).toBeNull()
  })

  it('a case keeps its slug; only a lesson can be a foundation lesson', () => {
    const snap = snapshotRound(answered(1), { mode: 'case', caseSlug: 'nutna-obrana', foundation: true }, 1)!
    expect(snap.caseSlug).toBe('nutna-obrana')
    expect(snap.foundation).toBe(false)
    expect(roundKey('case', 'nutna-obrana')).toBe('case:nutna-obrana')
    expect(roundKey('lesson', null)).toBe('lesson')
  })

  it('drops malformed stored rounds', () => {
    const good = snapshotRound(answered(1), meta, 1)!
    const out = normalizeRounds({
      lesson: good,
      'case:x': { ...good, mode: 'case', caseSlug: 'y' }, // key does not match
      'case:z': { ...good, mode: 'exam' },
      bad: null,
    })
    expect(Object.keys(out)).toEqual(['lesson'])
    expect(normalizeRounds('nope')).toEqual({})
    expect(
      normalizeRounds({ lesson: { ...good, records: [{ id: 1, choice: 'd' }] } }),
    ).toEqual({})
  })
})
