import { describe, it, expect } from 'vitest'
import { days, questions } from './czech'

// Czech plural forms: 1 / 2–4 / 0 and 5+.
describe('Czech plurals', () => {
  it('days: den / dny / dní', () => {
    expect([0, 1, 2, 3, 4, 5, 12, 41].map(days)).toEqual(['dní', 'den', 'dny', 'dny', 'dny', 'dní', 'dní', 'dní'])
  })
  it('questions: otázka / otázky / otázek', () => {
    expect([0, 1, 2, 4, 5, 837].map(questions)).toEqual(['otázek', 'otázka', 'otázky', 'otázky', 'otázek', 'otázek'])
  })
})
