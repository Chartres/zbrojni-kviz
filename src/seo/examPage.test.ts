import { describe, it, expect } from 'vitest'
import { renderExamPage, resolveQuote } from './examPage.mjs'
import guide from '@data/exam-guide.json'
import z90 from '@data/law/2024-90.json'
import nv238 from '@data/law/2025-238.json'

const ACTS = { '2024-90': z90, '2025-238': nv238 }
const ORIGIN = 'https://zbrojnikviz.dravec.org'
const html = renderExamPage({ guide, acts: ACTS, origin: ORIGIN, cssHref: '/x.css' })

describe('"jak probíhá zkouška" page', () => {
  it('quotes a provision with its children when asked for the whole of it', () => {
    const q = resolveQuote(ACTS, { act: '2025-238', unit: 'p12-2', whole: true })
    expect(q.label).toBe('§ 12 odst. 2')
    expect(q.text).toMatch(/ze 17 testových otázek/)
    expect(q.text).toMatch(/ze 3 testových otázek ze znalosti zdravotnického minima/)
  })

  it('every cited provision exists in the parsed acts', () => {
    for (const f of guide.faq) for (const c of f.cites) expect(() => resolveQuote(ACTS, c)).not.toThrow()
  })

  it('states the legal format and quotes § 20 odst. 3 písm. a) verbatim', () => {
    expect(html).toContain('30 otázek')
    expect(html).toContain('v čase nejdéle 40 minut správně zodpoví z 30 testových otázek alespoň 26')
    expect(html).toContain(`${ORIGIN}/zkouska/`)
  })

  it('carries FAQPage JSON-LD with every visible question', () => {
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity.map((q: { name: string }) => q.name)).toEqual(guide.faq.map((f) => f.q))
  })

  it('is static: no app bundle', () => {
    expect(html).not.toMatch(/<script type="module"/)
  })
})
