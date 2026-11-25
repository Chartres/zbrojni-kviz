import { describe, it, expect } from 'vitest'
import { classes, learners, days, questions } from './czech'

// Czech plural forms: 1 / 2–4 / 0 and 5+.
describe('Czech plurals', () => {
  it('days: den / dny / dní', () => {
    expect([0, 1, 2, 3, 4, 5, 12, 41].map(days)).toEqual(['dní', 'den', 'dny', 'dny', 'dny', 'dní', 'dní', 'dní'])
  })
  it('questions: otázka / otázky / otázek', () => {
    expect([0, 1, 2, 4, 5, 837].map(questions)).toEqual(['otázek', 'otázka', 'otázky', 'otázky', 'otázek', 'otázek'])
  })
})

describe('classes and learners (instructor backup)', () => {
  it('třída / třídy / tříd and žák / žáci / žáků', () => {
    expect([0, 1, 2, 5].map(classes)).toEqual(['tříd', 'třída', 'třídy', 'tříd'])
    expect([0, 1, 3, 7].map(learners)).toEqual(['žáků', 'žák', 'žáci', 'žáků'])
  })
})
