// Pavol's rule (2026-11-01): every answer counts the moment it is given; an unfinished lesson
// waits with Pokračovat / Nový trénink; the streak counts only a finished lesson; a mock exam
// left early keeps its answers but records no attempt.
import { describe, it, expect } from 'vitest'
import { reducer, initialState, type AppState } from './store'
import { makeRng } from '@/domain/rng'
import { answeredCount, statFor } from '@/domain/progress'
import { currentQuestion } from '@/domain/session'
import { CASES } from '@/domain/cases'

const TODAY = '2026-11-01'

function answerAndNext(s: AppState, n: number, now = 1000): AppState {
  for (let i = 0; i < n; i++) {
    const cur = currentQuestion(s.session!)!
    s = reducer(s, { type: 'answer', choice: cur.correct, now: now + i })
    s = reducer(s, { type: 'next', today: TODAY, now: now + i })
  }
  return s
}

function leftAt8(): { s: AppState; ids: number[] } {
  let s = reducer(initialState(), { type: 'startLesson', rng: makeRng(7) })
  const ids = s.session!.questions.map((q) => q.id)
  s = answerAndNext(s, 8)
  s = reducer(s, { type: 'goMenu' })
  return { s, ids }
}

describe('unfinished lesson', () => {
  it('leaving at 8 of 12 keeps the answers and the round, but no streak', () => {
    const { s, ids } = leftAt8()
    expect(s.view).toBe('home')
    expect(answeredCount(s.progress)).toBe(8)
    expect(s.progress.streak.current).toBe(0)
    expect(s.rounds.lesson?.ids).toEqual(ids)
    expect(s.rounds.lesson?.records).toHaveLength(8)
  })

  it('Pokračovat: same questions, same order, at question 9, still a foundation lesson', () => {
    const { s: left, ids } = leftAt8()
    const s = reducer(left, { type: 'resumeLesson' })
    expect(s.view).toBe('quiz')
    expect(s.mode).toBe('lesson')
    expect(s.foundation).toBe(true)
    expect(s.session!.questions.map((q) => q.id)).toEqual(ids)
    expect(s.session!.index).toBe(8)
    expect(currentQuestion(s.session!)!.id).toBe(ids[8])
  })

  it('finishing the resumed lesson scores all 12, counts the streak and clears the round', () => {
    let s = reducer(leftAt8().s, { type: 'resumeLesson' })
    s = answerAndNext(s, 4, 5000)
    expect(s.view).toBe('results')
    expect(s.session!.records).toHaveLength(12)
    expect(s.progress.streak.current).toBe(1)
    expect(s.rounds.lesson).toBeUndefined()
    // answers were not recorded twice
    expect(Object.values(s.progress.stats).every((st) => st.seen === 1)).toBe(true)
  })

  it('Nový trénink replaces it; the new set skips the 8 answered except a review minority', () => {
    const { s: left, ids } = leftAt8()
    const s = reducer(left, { type: 'startLesson', rng: makeRng(8) })
    expect(s.rounds.lesson).toBeUndefined()
    const again = s.session!.questions.filter((q) => ids.slice(0, 8).includes(q.id))
    expect(again.length).toBeLessThanOrEqual(4) // the spaced-repetition share, at most 40 %
    expect(s.session!.questions).toHaveLength(12)
  })

  it('leaving before the first answer keeps nothing to resume', () => {
    let s = reducer(initialState(), { type: 'startLesson', rng: makeRng(1) })
    s = reducer(s, { type: 'goMenu' })
    expect(s.rounds).toEqual({})
  })

  it('a lost round (bank changed) falls back to the home screen and is dropped', () => {
    const { s: left } = leftAt8()
    const broken = { ...left, rounds: { lesson: { ...left.rounds.lesson!, ids: [999999] } } }
    const s = reducer(broken, { type: 'resumeLesson' })
    expect(s.view).toBe('home')
    expect(s.rounds.lesson).toBeUndefined()
  })
})

describe('unfinished case', () => {
  it('starting the case again resumes at the first unanswered question', () => {
    const c = CASES[0]
    let s = reducer(initialState(), { type: 'startCase', slug: c.slug })
    s = answerAndNext(s, 3)
    s = reducer(s, { type: 'goMenu' })
    expect(s.rounds[`case:${c.slug}`]).toBeDefined()
    s = reducer(s, { type: 'startCase', slug: c.slug })
    expect(s.caseSlug).toBe(c.slug)
    expect(s.session!.index).toBe(3)
    s = answerAndNext(s, c.questions.length - 3)
    expect(s.view).toBe('results')
    expect(s.rounds[`case:${c.slug}`]).toBeUndefined()
  })

  it('a case does not touch the unfinished lesson', () => {
    let s = leftAt8().s
    s = reducer(s, { type: 'startCase', slug: CASES[0].slug })
    s = answerAndNext(s, CASES[0].questions.length)
    expect(s.rounds.lesson?.records).toHaveLength(8)
  })
})

describe('mock exam left early', () => {
  it('keeps the answers given, records no attempt and nothing to resume', () => {
    let s = reducer(initialState(), { type: 'startExam', rng: makeRng(3), now: 0 })
    const first = s.session!.questions.slice(0, 5)
    s = answerAndNext(s, 5)
    s = reducer(s, { type: 'goMenu' })
    expect(first.every((q) => statFor(s.progress, q.id).seen === 1)).toBe(true)
    expect(s.progress.examAttempts).toEqual([])
    expect(s.rounds).toEqual({})
  })
})

describe('practice by okruh', () => {
  it('serves never-answered questions first', () => {
    let s = reducer(initialState(), { type: 'setCategories', categories: new Set(['Jiné předpisy']) })
    s = reducer(s, { type: 'startPractice', rng: makeRng(1) })
    const done = s.session!.questions.slice(0, 10).map((q) => q.id)
    s = answerAndNext(s, 10)
    s = reducer(s, { type: 'goMenu' })
    s = reducer(s, { type: 'startPractice', rng: makeRng(2) })
    const order = s.session!.questions.map((q) => q.id)
    expect(order).toHaveLength(39)
    expect(order.slice(0, 29).some((id) => done.includes(id))).toBe(false)
  })
})
