import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import { buildLesson, LESSON_SIZE } from './lesson'
import { emptyProgress, recordAnswer, MASTERY_STREAK } from './progress'
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
