import { describe, it, expect } from 'vitest'
import { reducer, initialState, type AppState } from './store'
import { makeRng } from '@/domain/rng'
import { emptyProgress, recordAnswer, statFor } from '@/domain/progress'
import { currentQuestion, score } from '@/domain/session'

function start(overrides: Partial<AppState> = {}): AppState {
  return { ...initialState(), ...overrides }
}

describe('app store', () => {
  it('starts practice for the selected categories', () => {
    let s = start()
    s = reducer(s, { type: 'setCategories', categories: new Set(['Jiné předpisy']) })
    s = reducer(s, { type: 'startPractice', rng: makeRng(1) })
    expect(s.view).toBe('quiz')
    expect(s.mode).toBe('practice')
    expect(s.session?.questions.length).toBe(39)
    expect(s.session?.questions.every((q) => q.cat === 'Jiné předpisy')).toBe(true)
  })

  it('answering records to the session and to progress', () => {
    let s = start()
    s = reducer(s, { type: 'setCategories', categories: new Set(['Jiné předpisy']) })
    s = reducer(s, { type: 'startPractice', rng: makeRng(1) })
    const cur = currentQuestion(s.session!)!
    s = reducer(s, { type: 'answer', choice: cur.correct, now: 1000 })
    expect(score(s.session!)).toBe(1)
    expect(statFor(s.progress, cur.id).correct).toBe(1)
  })

  it('advances and finishes into results', () => {
    let s = start()
    s = reducer(s, { type: 'setCategories', categories: new Set(['Jiné předpisy']) })
    s = reducer(s, { type: 'startPractice', rng: makeRng(1) })
    const total = s.session!.questions.length
    for (let i = 0; i < total; i++) {
      const cur = currentQuestion(s.session!)!
      s = reducer(s, { type: 'answer', choice: cur.correct, now: i })
      s = reducer(s, { type: 'next', now: i })
    }
    expect(s.view).toBe('results')
  })

  it('runs an exam and evaluates pass/fail on finish', () => {
    let s = start()
    s = reducer(s, { type: 'startExam', rng: makeRng(7), now: 0 })
    expect(s.mode).toBe('exam')
    expect(s.session?.questions.length).toBe(60)
    expect(s.examEndsAt).toBe(80 * 60 * 1000)
    // answer everything correctly
    for (let i = 0; i < 60; i++) {
      const cur = currentQuestion(s.session!)!
      s = reducer(s, { type: 'answer', choice: cur.correct, now: i })
      s = reducer(s, { type: 'next', now: i })
    }
    expect(s.view).toBe('results')
    expect(s.examResult?.passed).toBe(true)
    expect(s.examResult?.score).toBe(60)
  })

  it('finishExam (time up) evaluates the partial session', () => {
    let s = start()
    s = reducer(s, { type: 'startExam', rng: makeRng(7), now: 0 })
    s = reducer(s, { type: 'finishExam', now: 1000 })
    expect(s.view).toBe('results')
    expect(s.examResult?.passed).toBe(false)
  })

  it('records a persisted exam attempt when an exam is completed normally', () => {
    let s = start()
    s = reducer(s, { type: 'startExam', rng: makeRng(7), now: 0 })
    for (let i = 0; i < 60; i++) {
      const cur = currentQuestion(s.session!)!
      s = reducer(s, { type: 'answer', choice: cur.correct, now: i })
      s = reducer(s, { type: 'next', now: 12345 })
    }
    expect(s.progress.examAttempts).toHaveLength(1)
    expect(s.progress.examAttempts?.[0]).toMatchObject({
      at: 12345,
      score: 60,
      total: 60,
      passed: true,
    })
  })

  it('records a persisted exam attempt when an exam times out (finishExam)', () => {
    let s = start()
    s = reducer(s, { type: 'startExam', rng: makeRng(7), now: 0 })
    s = reducer(s, { type: 'finishExam', now: 99999 })
    expect(s.progress.examAttempts).toHaveLength(1)
    expect(s.progress.examAttempts?.[0]).toMatchObject({
      at: 99999,
      score: 0,
      total: 60,
      passed: false,
    })
  })

  it('does not record an exam attempt for non-exam sessions', () => {
    let s = start()
    s = reducer(s, { type: 'setCategories', categories: new Set(['Jiné předpisy']) })
    s = reducer(s, { type: 'startPractice', rng: makeRng(1) })
    const total = s.session!.questions.length
    for (let i = 0; i < total; i++) {
      const cur = currentQuestion(s.session!)!
      s = reducer(s, { type: 'answer', choice: cur.correct, now: i })
      s = reducer(s, { type: 'next', now: i })
    }
    expect(s.progress.examAttempts ?? []).toHaveLength(0)
  })

  it('starts a weak-area drill session', () => {
    let p = emptyProgress()
    // 3 wrong answers in the same category qualify it as weak
    p = recordAnswer(p, 1, false, 1) // 'Zákon o zbraních'
    p = recordAnswer(p, 2, false, 2)
    p = recordAnswer(p, 3, false, 3)
    let s = start({ progress: p })
    s = reducer(s, { type: 'startWeakDrill', rng: makeRng(1) })
    expect(s.mode).toBe('weakDrill')
    expect(s.view).toBe('quiz')
    expect(s.session?.questions.length).toBeGreaterThan(0)
  })

  it('starts a review session from the weak-spots queue', () => {
    let p = emptyProgress()
    p = recordAnswer(p, 610, false, 10)
    p = recordAnswer(p, 611, false, 20)
    let s = start({ progress: p })
    s = reducer(s, { type: 'startReview', rng: makeRng(1) })
    expect(s.mode).toBe('review')
    expect(s.session?.questions.map((q) => q.id)).toEqual([610, 611])
  })

  it('toggles bookmarks in progress', () => {
    let s = start()
    s = reducer(s, { type: 'toggleBookmark', id: 3 })
    expect(s.progress.bookmarks).toContain(3)
  })

  it('runs a finishable daily lesson and bumps the streak on completion', () => {
    let s = start()
    s = reducer(s, { type: 'startLesson', rng: makeRng(2) })
    expect(s.mode).toBe('lesson')
    expect(s.session?.questions.length).toBe(12)
    const total = s.session!.questions.length
    for (let i = 0; i < total; i++) {
      const cur = currentQuestion(s.session!)!
      s = reducer(s, { type: 'answer', choice: cur.correct, now: i })
      s = reducer(s, { type: 'next', today: '2026-06-06', now: i })
    }
    expect(s.view).toBe('results')
    expect(s.progress.streak.current).toBe(1)
  })

  it('returns to the menu and clears the active session', () => {
    let s = start()
    s = reducer(s, { type: 'startExam', rng: makeRng(1), now: 0 })
    s = reducer(s, { type: 'goMenu' })
    expect(s.view).toBe('home')
    expect(s.session).toBeNull()
    expect(s.examEndsAt).toBeNull()
  })
})
