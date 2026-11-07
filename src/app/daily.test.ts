// Test D in the store: Otázka dne is a one-question round. The answer counts in progress like any
// other; the daily streak (device) moves once per day; the lesson streak does not.
import { describe, it, expect } from 'vitest'
import { reducer, initialState, type AppState } from './store'
import { currentQuestion } from '@/domain/session'
import { dailyQuestionId, emptyDaily } from '@/domain/daily'
import { statFor } from '@/domain/progress'

const DAY = '2026-11-07'
const optedIn = (): AppState => ({ ...initialState(), daily: { ...emptyDaily(), optedIn: true } })

describe('Otázka dne in the store', () => {
  it('opt in and out', () => {
    let s = reducer(initialState(), { type: 'setDailyOptIn', on: true })
    expect(s.daily.optedIn).toBe(true)
    s = reducer(s, { type: 'setDailyOptIn', on: false })
    expect(s.daily.optedIn).toBe(false)
  })

  it("serves today's question; answering counts in progress and the daily streak, then home", () => {
    let s = reducer(optedIn(), { type: 'startDaily', day: DAY })
    expect(s.mode).toBe('daily')
    expect(s.session!.questions.map((q) => q.id)).toEqual([dailyQuestionId(DAY)])
    const q = currentQuestion(s.session!)!
    s = reducer(s, { type: 'answer', choice: q.correct, now: 1 })
    expect(statFor(s.progress, q.id).correct).toBe(1)
    expect(s.daily.days[DAY]).toBe(1)
    expect(s.daily.current).toBe(1)
    s = reducer(s, { type: 'next', today: DAY, now: 2 })
    expect(s.view).toBe('home')
    expect(s.mode).toBeNull()
    expect(s.progress.streak.current).toBe(0) // the lesson streak is untouched
    expect(s.rounds).toEqual({})
  })

  it('once answered today, starting again does nothing', () => {
    let s = reducer(optedIn(), { type: 'startDaily', day: DAY })
    s = reducer(s, { type: 'answer', choice: 'a', now: 1 })
    s = reducer(s, { type: 'next', today: DAY, now: 2 })
    expect(reducer(s, { type: 'startDaily', day: DAY })).toBe(s)
  })

  it('not opted in: no daily round', () => {
    const s = initialState()
    expect(reducer(s, { type: 'startDaily', day: DAY })).toBe(s)
  })
})
