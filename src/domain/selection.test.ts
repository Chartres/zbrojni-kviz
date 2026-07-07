import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import {
  filterQuestions,
  buildPractice,
  reviewQuestions,
  bookmarkedQuestions,
  normalizeForSearch,
  weakCategories,
  buildWeakDrill,
} from './selection'
import { ALL_QUESTIONS, byCategory } from './questions'
import { emptyProgress, recordAnswer, toggleBookmark } from './progress'
import type { Question } from './types'

function q(id: number, cat: Question['cat'] = 'Zákon o zbraních'): Question {
  return { id, cat, q: `q${id}`, a: 'a', b: 'b', c: 'c', correct: 'a', images: [] }
}

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

describe('weakCategories', () => {
  it('returns [] when no category has enough seen questions', () => {
    const questions = [q(1), q(2), q(3)]
    let p = emptyProgress()
    p = recordAnswer(p, 1, false, 1) // only 1 seen — below the ≥3 threshold
    expect(weakCategories(questions, p)).toEqual([])
  })

  it('excludes categories with perfect accuracy', () => {
    const questions = [q(1), q(2), q(3)]
    let p = emptyProgress()
    p = recordAnswer(p, 1, true, 1)
    p = recordAnswer(p, 2, true, 2)
    p = recordAnswer(p, 3, true, 3)
    expect(weakCategories(questions, p)).toEqual([])
  })

  it('ranks qualifying categories worst-accuracy-first', () => {
    const questions = [
      q(1, 'Zákon o zbraních'),
      q(2, 'Zákon o zbraních'),
      q(3, 'Zákon o zbraních'),
      q(11, 'Nauka o zbraních'),
      q(12, 'Nauka o zbraních'),
      q(13, 'Nauka o zbraních'),
    ]
    let p = emptyProgress()
    // Zákon: 1 correct of 3 -> accuracy 1/3
    p = recordAnswer(p, 1, false, 1)
    p = recordAnswer(p, 2, false, 2)
    p = recordAnswer(p, 3, true, 3)
    // Nauka: 0 correct of 3 -> accuracy 0 (worse)
    p = recordAnswer(p, 11, false, 11)
    p = recordAnswer(p, 12, false, 12)
    p = recordAnswer(p, 13, false, 13)

    const weak = weakCategories(questions, p)
    expect(weak.map((w) => w.cat)).toEqual(['Nauka o zbraních', 'Zákon o zbraních'])
    expect(weak[0].accuracy).toBe(0)
    expect(weak[1].accuracy).toBeCloseTo(1 / 3)
  })

  it('caps the result at the 3 worst qualifying categories', () => {
    const cats: Question['cat'][] = [
      'Zákon o zbraních',
      'Prováděcí předpisy',
      'Jiné předpisy',
      'Nauka o zbraních',
    ]
    const questions = cats.flatMap((cat, ci) =>
      [0, 1, 2].map((i) => q(ci * 10 + i, cat)),
    )
    let p = emptyProgress()
    for (const cat of cats) {
      for (const i of [0, 1, 2]) {
        const id = cats.indexOf(cat) * 10 + i
        p = recordAnswer(p, id, false, id) // every category equally wrong
      }
    }
    expect(weakCategories(questions, p)).toHaveLength(3)
  })
})

describe('buildWeakDrill', () => {
  it('returns [] when no category qualifies as weak', () => {
    const questions = [q(1), q(2)]
    const p = emptyProgress()
    expect(buildWeakDrill(questions, p, makeRng(1))).toEqual([])
  })

  it('prioritises currently-wrong, then not-yet-mastered, then least-recently-seen mastered, then tops up with unseen', () => {
    const cat: Question['cat'] = 'Zákon o zbraních'
    const [wrong, notMastered, masteredOld, masteredNew, unseenA, unseenB] = [
      q(1, cat),
      q(2, cat),
      q(3, cat),
      q(4, cat),
      q(5, cat),
      q(6, cat),
    ]
    let p = emptyProgress()
    p = recordAnswer(p, 1, false, 100) // currently wrong (streak 0)
    p = recordAnswer(p, 2, true, 100) // seen once, not yet mastered (streak 1)
    p = recordAnswer(p, 3, true, 10)
    p = recordAnswer(p, 3, true, 11) // mastered, last seen at 11 (older)
    p = recordAnswer(p, 4, true, 50)
    p = recordAnswer(p, 4, true, 51) // mastered, last seen at 51 (newer)

    const questions = [wrong, notMastered, masteredOld, masteredNew, unseenA, unseenB]
    const result = buildWeakDrill(questions, p, makeRng(1), 6)

    expect(result.map((r) => r.id).slice(0, 4)).toEqual([1, 2, 3, 4])
    expect(result).toHaveLength(6)
    expect(new Set(result.slice(4).map((r) => r.id))).toEqual(new Set([5, 6]))
  })

  it('excludes questions from categories that are not weak', () => {
    const weakCat: Question['cat'] = 'Zákon o zbraních'
    const otherCat: Question['cat'] = 'Nauka o zbraních'
    const questions = [
      q(1, weakCat),
      q(2, weakCat),
      q(3, weakCat),
      q(4, otherCat), // never answered — should not qualify or leak in
    ]
    let p = emptyProgress()
    p = recordAnswer(p, 1, false, 1)
    p = recordAnswer(p, 2, false, 2)
    p = recordAnswer(p, 3, false, 3)

    const result = buildWeakDrill(questions, p, makeRng(1))
    expect(result.every((r) => r.cat === weakCat)).toBe(true)
  })

  it('is deterministic under the seeded rng', () => {
    const cat: Question['cat'] = 'Zákon o zbraních'
    const questions = Array.from({ length: 10 }, (_, i) => q(i, cat))
    let p = emptyProgress()
    p = recordAnswer(p, 0, false, 1)
    p = recordAnswer(p, 1, false, 2)
    p = recordAnswer(p, 2, false, 3)

    const a = buildWeakDrill(questions, p, makeRng(42)).map((r) => r.id)
    const b = buildWeakDrill(questions, p, makeRng(42)).map((r) => r.id)
    expect(a).toEqual(b)
  })
})
