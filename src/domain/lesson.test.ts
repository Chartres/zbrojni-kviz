import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import { buildLesson, isFoundationPhase, FOUNDATION_ANSWERS, LESSON_SIZE } from './lesson'
import { emptyProgress, recordAnswer, MASTERY_STREAK } from './progress'
import { ALL_QUESTIONS, META, examGroupOf } from './questions'
import type { ExamGroup } from './types'

describe('buildLesson', () => {
  it('is always a finishable fixed size', () => {
    expect(buildLesson(emptyProgress(), makeRng(1))).toHaveLength(LESSON_SIZE)
  })

  it('stays full size once every question is mastered (streak can still extend)', () => {
    let p = emptyProgress()
    for (const q of ALL_QUESTIONS) {
      for (let i = 0; i < MASTERY_STREAK; i++) p = recordAnswer(p, q.id, true, 100 + i)
    }
    expect(buildLesson(p, makeRng(4))).toHaveLength(LESSON_SIZE)
  })

  it('never contains both questions of a known duplicate pair', () => {
    // both twins due for review: the review pass must not take both
    let p = emptyProgress()
    for (const [x, y] of META.duplicatePairs) {
      p = recordAnswer(p, x, false, 1)
      p = recordAnswer(p, y, false, 2)
    }
    const lessons = [buildLesson(p, makeRng(1))]
    // top-up path: every question mastered except the twins (unseen)
    let m = emptyProgress()
    const twinIds = new Set(META.duplicatePairs.flat())
    for (const q of ALL_QUESTIONS) {
      if (twinIds.has(q.id)) continue
      for (let i = 0; i < MASTERY_STREAK; i++) m = recordAnswer(m, q.id, true, 100 + i)
    }
    for (let seed = 1; seed <= 50; seed++) lessons.push(buildLesson(m, makeRng(seed)))
    for (const lesson of lessons) {
      const ids = new Set(lesson.map((q) => q.id))
      for (const [x, y] of META.duplicatePairs) expect(ids.has(x) && ids.has(y)).toBe(false)
    }
  })

  it('has no duplicate questions', () => {
    const lesson = buildLesson(emptyProgress(), makeRng(2))
    expect(new Set(lesson.map((q) => q.id)).size).toBe(LESSON_SIZE)
  })

  it('after the foundation lessons, draws unseen questions weighted toward legal (exam mix)', () => {
    let p = emptyProgress()
    // past the foundation phase: answered correctly once (seen, not mastered, not due)
    for (const q of ALL_QUESTIONS.slice(0, FOUNDATION_ANSWERS)) p = recordAnswer(p, q.id, true, 1)
    expect(isFoundationPhase(p)).toBe(false)
    const lesson = buildLesson(p, makeRng(3))
    const byGroup: Record<ExamGroup, number> = { pravni: 0, nauka: 0, bezpecnost: 0, zdravotnicke: 0 }
    for (const q of lesson) byGroup[examGroupOf(q)]++
    // legal dominates, matching the real 17:5:5:3 composition
    expect(byGroup.pravni).toBeGreaterThanOrEqual(6)
    expect(byGroup.bezpecnost).toBeGreaterThanOrEqual(1)
  })

  it('prioritises due reviews (weak spots) when the learner has wrong answers', () => {
    let p = emptyProgress()
    // 8 questions answered wrong → due for review
    const wrongIds = [1, 2, 3, 4, 5, 6, 7, 8]
    wrongIds.forEach((id, i) => (p = recordAnswer(p, id, false, 100 + i)))
    const lesson = buildLesson(p, makeRng(4))
    const included = lesson.filter((q) => wrongIds.includes(q.id)).length
    expect(included).toBeGreaterThan(0)
    // but the lesson is still mostly fresh material, not ALL review
    expect(included).toBeLessThan(LESSON_SIZE)
  })

  it('does not re-serve mastered questions as new material', () => {
    let p = emptyProgress()
    // master question 1
    for (let i = 0; i < MASTERY_STREAK; i++) p = recordAnswer(p, 1, true, i)
    const lesson = buildLesson(p, makeRng(5))
    expect(lesson.some((q) => q.id === 1)).toBe(false)
  })
})

describe('bezpečnost first (foundation lessons)', () => {
  const groups = (lesson: { id: number }[]) =>
    lesson.map((q) => examGroupOf(ALL_QUESTIONS.find((x) => x.id === q.id)!))

  it('a new learner is in the foundation phase until about three lessons are answered', () => {
    let p = emptyProgress()
    expect(isFoundationPhase(p)).toBe(true)
    for (const q of ALL_QUESTIONS.slice(0, FOUNDATION_ANSWERS - 1)) p = recordAnswer(p, q.id, true, 1)
    expect(isFoundationPhase(p)).toBe(true)
    p = recordAnswer(p, ALL_QUESTIONS[FOUNDATION_ANSWERS].id, true, 1)
    expect(isFoundationPhase(p)).toBe(false)
  })

  it('the first lesson leans on safe handling and first aid, and opens with safe handling', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = groups(buildLesson(emptyProgress(), makeRng(seed)))
      const count = (x: ExamGroup) => g.filter((y) => y === x).length
      expect(count('bezpecnost')).toBe(5)
      expect(count('zdravotnicke')).toBe(3)
      expect(count('bezpecnost') + count('zdravotnicke')).toBeGreaterThan(LESSON_SIZE / 2)
      expect(count('pravni')).toBeGreaterThanOrEqual(1) // leans, not only
      expect(g[0]).toBe('bezpecnost')
    }
  })

  it('draws safe handling only from the exam-handling rules and safety principles (q562–596, q784–799)', () => {
    const lesson = buildLesson(emptyProgress(), makeRng(7))
    for (const q of lesson.filter((x) => examGroupOf(x) === 'bezpecnost')) {
      expect((q.id >= 562 && q.id <= 596) || (q.id >= 784 && q.id <= 799)).toBe(true)
    }
  })

  it('the second and third lessons still lean on the foundation, with no repeats once mastered', () => {
    let p = emptyProgress()
    const seen = new Set<number>()
    for (let n = 0; n < 3; n++) {
      const lesson = buildLesson(p, makeRng(10 + n))
      expect(lesson).toHaveLength(LESSON_SIZE)
      const g = groups(lesson)
      expect(g.filter((x) => x === 'bezpecnost' || x === 'zdravotnicke').length).toBeGreaterThanOrEqual(7)
      for (const q of lesson) {
        expect(seen.has(q.id)).toBe(false)
        seen.add(q.id)
        for (let i = 0; i < MASTERY_STREAK; i++) p = recordAnswer(p, q.id, true, n * 10 + i)
      }
    }
    expect(isFoundationPhase(p)).toBe(false)
  })
})
