import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import {
  filterQuestions,
  buildPractice,
  reviewQuestions,
  bookmarkedQuestions,
  normalizeForSearch,
} from './selection'
import { ALL_QUESTIONS, byCategory } from './questions'
import { emptyProgress, recordAnswer, toggleBookmark } from './progress'

describe('normalizeForSearch', () => {
  it('lowercases and strips Czech diacritics', () => {
    expect(normalizeForSearch('Zbraň ČÁST tíseň')).toBe('zbran cast tisen')
  })
})

describe('filterQuestions', () => {
  it('returns everything with no filters', () => {
    expect(filterQuestions({})).toHaveLength(ALL_QUESTIONS.length)
  })

  it('filters by a set of categories', () => {
    const res = filterQuestions({
      categories: new Set(['Nauka o zbraních']),
    })
    expect(res.length).toBe(byCategory('Nauka o zbraních').length)
    expect(res.every((q) => q.cat === 'Nauka o zbraních')).toBe(true)
  })

  it('searches diacritic-insensitively across stem and options', () => {
    const withDiacritics = filterQuestions({ search: 'zbraň' })
    const without = filterQuestions({ search: 'zbran' })
    expect(without.length).toBe(withDiacritics.length)
    expect(without.length).toBeGreaterThan(0)
  })

  it('combines category and search', () => {
    const res = filterQuestions({
      categories: new Set(['Zdravotnické minimum']),
      search: 'krv',
    })
    expect(res.every((q) => q.cat === 'Zdravotnické minimum')).toBe(true)
  })
})

describe('buildPractice', () => {
  it('shuffles deterministically by seed', () => {
    const a = buildPractice({ categories: new Set(['Jiné předpisy']) }, makeRng(1))
    const b = buildPractice({ categories: new Set(['Jiné předpisy']) }, makeRng(1))
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id))
  })

  it('contains exactly the filtered questions', () => {
    const res = buildPractice(
      { categories: new Set(['Jiné předpisy']) },
      makeRng(2),
    )
    expect(new Set(res.map((q) => q.id))).toEqual(
      new Set(byCategory('Jiné předpisy').map((q) => q.id)),
    )
  })
})

describe('reviewQuestions', () => {
  it('returns the spaced-repetition queue as full questions', () => {
    let p = emptyProgress()
    p = recordAnswer(p, 2, false, 50)
    p = recordAnswer(p, 3, false, 90)
    const ids = reviewQuestions(p).map((q) => q.id)
    expect(ids).toEqual([2, 3])
  })
})

describe('bookmarkedQuestions', () => {
  it('returns the bookmarked questions', () => {
    let p = emptyProgress()
    p = toggleBookmark(p, 1)
    p = toggleBookmark(p, 500)
    expect(bookmarkedQuestions(p).map((q) => q.id).sort((a, b) => a - b)).toEqual(
      [1, 500],
    )
  })
})
