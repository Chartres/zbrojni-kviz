import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import { buildLesson, LESSON_SIZE } from './lesson'
import { emptyProgress, recordAnswer, MASTERY_STREAK } from './progress'
import { ALL_QUESTIONS, META } from './questions'
import type { ExamGroup } from './types'

const GROUP_OF: Record<string, ExamGroup> = {
  'Zákon o zbraních': 'pravni',
  'Prováděcí předpisy': 'pravni',
  'Jiné předpisy': 'pravni',
  'Nauka o zbraních': 'nauka',
  'Zdravotnické minimum': 'zdravotnicke',
}

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

  it('for a new learner, draws unseen questions weighted toward legal (exam mix)', () => {
    const lesson = buildLesson(emptyProgress(), makeRng(3))
    const byGroup: Record<ExamGroup, number> = { pravni: 0, nauka: 0, zdravotnicke: 0 }
    for (const q of lesson) byGroup[GROUP_OF[q.cat]]++
    // legal dominates, matching the real 52:5:3 composition
    expect(byGroup.pravni).toBeGreaterThanOrEqual(7)
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
