import { describe, it, expect } from 'vitest'
import { differ, isNearMiss } from './difference'
import { getQuestion } from './questions'

const marked = (segs: ReturnType<typeof differ>['right']) =>
  segs.filter((s) => s.changed).map((s) => s.text.trim())

describe('differ — control of error between two options', () => {
  it('marks only the words that make the options different', () => {
    const { wrong, right } = differ(
      'lékařský posudek se vydává s dobou platnosti 10 let.',
      'lékařský posudek se vydává s dobou platnosti 5 let.',
    )
    expect(marked(wrong)).toEqual(['10'])
    expect(marked(right)).toEqual(['5'])
  })

  it('keeps every character, so the segments rebuild the original text', () => {
    const a = 'Ano, výjimky stanoví zákon v § 81 pro vybrané akce.'
    const b = 'Ne, nosit zbraň smí každý držitel zbrojního oprávnění.'
    const { wrong, right } = differ(a, b)
    expect(wrong.map((s) => s.text).join('')).toBe(a)
    expect(right.map((s) => s.text).join('')).toBe(b)
  })

  it('ignores case and trailing punctuation when comparing words', () => {
    const { right } = differ('Zbraň kategorie R3.', 'zbraň kategorie R4')
    expect(marked(right)).toEqual(['R4'])
  })

  it('handles an empty option', () => {
    expect(differ('', 'něco').right.map((s) => s.text).join('')).toBe('něco')
  })
})

describe('isNearMiss — is the difference worth showing?', () => {
  it('is true when the options share most of their words', () => {
    expect(
      isNearMiss(
        'lékařský posudek se vydává s dobou platnosti 10 let.',
        'lékařský posudek se vydává s dobou platnosti 5 let.',
      ),
    ).toBe(true)
  })

  it('is false when the options are about different things (highlighting everything says nothing)', () => {
    expect(isNearMiss('PO.', 'kryté nebo otevřené.')).toBe(false)
  })

  it('on the official bank, points at the one inserted words (q4: "chladná zbraň")', () => {
    const q = getQuestion(4)!
    const wrongOpt = (['a', 'b', 'c'] as const).find((o) => o !== q.correct && q[o].includes('chladná'))!
    expect(isNearMiss(q[wrongOpt], q[q.correct])).toBe(true)
    expect(marked(differ(q[wrongOpt], q[q.correct]).wrong)).toEqual(['chladná zbraň'])
    expect(marked(differ(q[wrongOpt], q[q.correct]).right)).toEqual([])
  })
})
