// Test D (2026-11-07): Otázka dne. The same question for everyone on a given day, one answer a
// day, a streak kept on the device. Opt-in; the streak never nags.
import { describe, it, expect } from 'vitest'
import { answeredOn, dailyQuestionId, emptyDaily, liveDailyStreak, normalizeDaily, recordDaily, recentDays } from './daily'
import { getQuestion } from './questions'

describe('dailyQuestionId', () => {
  it('is the same for everyone on a day and changes from day to day', () => {
    expect(dailyQuestionId('2026-11-07')).toBe(dailyQuestionId('2026-11-07'))
    expect(getQuestion(dailyQuestionId('2026-11-07'))).toBeDefined()
    expect(dailyQuestionId('2026-11-08')).not.toBe(dailyQuestionId('2026-11-07'))
  })

  it('does not repeat a question within a year', () => {
    const ids = new Set<number>()
    const d = new Date(Date.UTC(2026, 10, 7))
    for (let i = 0; i < 365; i++) {
      ids.add(dailyQuestionId(d.toISOString().slice(0, 10)))
      d.setUTCDate(d.getUTCDate() + 1)
    }
    expect(ids.size).toBe(365)
  })
})

describe('the daily streak (on this device)', () => {
  it('counts consecutive days; the first answer of a day is the one that counts', () => {
    let s = { ...emptyDaily(), optedIn: true }
    s = recordDaily(s, '2026-11-07', true)
    s = recordDaily(s, '2026-11-07', false) // second try the same day: ignored
    expect(answeredOn(s, '2026-11-07')).toBe(true)
    expect(s.days['2026-11-07']).toBe(1)
    s = recordDaily(s, '2026-11-08', false)
    expect(s.current).toBe(2)
    s = recordDaily(s, '2026-11-10', true) // a day missed: starts again, no penalty beyond that
    expect(s.current).toBe(1)
    expect(s.best).toBe(2)
  })

  it('shows the streak while it is alive (today or yesterday), 0 after a missed day', () => {
    const s = recordDaily(recordDaily({ ...emptyDaily(), optedIn: true }, '2026-11-07', true), '2026-11-08', true)
    expect(liveDailyStreak(s, '2026-11-08')).toBe(2)
    expect(liveDailyStreak(s, '2026-11-09')).toBe(2)
    expect(liveDailyStreak(s, '2026-11-10')).toBe(0)
  })

  it('crosses month and year ends', () => {
    let s = recordDaily({ ...emptyDaily(), optedIn: true }, '2026-12-31', true)
    s = recordDaily(s, '2027-01-01', true)
    expect(s.current).toBe(2)
  })

  it('keeps only recent days and counts the last 7', () => {
    let s = { ...emptyDaily(), optedIn: true }
    const d = new Date(Date.UTC(2026, 9, 1))
    for (let i = 0; i < 40; i++) {
      s = recordDaily(s, d.toISOString().slice(0, 10), i % 2 === 0)
      d.setUTCDate(d.getUTCDate() + 1)
    }
    expect(Object.keys(s.days).length).toBeLessThanOrEqual(31)
    expect(recentDays(s, '2026-11-09')).toEqual({ answered: 7, correct: 3 })
  })

  it('normalizes what storage gives back', () => {
    expect(normalizeDaily(null)).toEqual(emptyDaily())
    expect(normalizeDaily({ optedIn: true, days: { '2026-11-07': 1 }, current: 1, best: 1, last: '2026-11-07' }).optedIn).toBe(true)
    expect(normalizeDaily({ optedIn: 'yes', days: 'x' })).toEqual(emptyDaily())
  })
})
