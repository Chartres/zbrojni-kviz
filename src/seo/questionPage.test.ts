import { describe, it, expect } from 'vitest'
import { renderQuestionPage, questionPath } from './questionPage.mjs'
import { getQuestion } from '@/domain/questions'
import { sourceFor } from '@/domain/sources'

const ORIGIN = 'https://zbrojnikviz.dravec.org'
const TOPIC = { slug: 'zakon-o-zbranich', category: 'Zákon o zbraních' }

function page(id: number) {
  const q = getQuestion(id)!
  return renderQuestionPage({
    q,
    source: sourceFor(id) ?? null,
    topic: TOPIC,
    prev: id > 1 ? id - 1 : null,
    next: id + 1,
    origin: ORIGIN,
    cssHref: '/assets/index.css',
  })
}

describe('per-question static page (readable without JavaScript)', () => {
  it('has one canonical URL per official question', () => {
    expect(questionPath(83)).toBe('/otazka/83/')
    expect(page(83)).toContain(`<link rel="canonical" href="${ORIGIN}/otazka/83/" />`)
  })

  it('puts the question in the title and h1 and states the correct option in plain text', () => {
    const q = getQuestion(1)!
    const html = page(1)
    expect(html).toContain('<h1')
    expect(html).toContain(q.q)
    expect(html).toMatch(/Správná odpověď: C/)
    for (const o of ['a', 'b', 'c'] as const) expect(html).toContain(q[o])
  })

  it('quotes the cited provision verbatim with its label and a link to the act', () => {
    const html = page(1)
    expect(html).toContain('§ 1 odst. 1')
    expect(html).toContain('za podmínek stanovených tímto zákonem')
    expect(html).toContain('https://www.zakonyprolidi.cz/cs/2024-90#p1-1')
  })

  it('carries Quiz JSON-LD with the accepted answer', () => {
    const html = page(1)
    const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
    expect(json['@type']).toBe('Quiz')
    const question = json.hasPart[0]
    expect(question['@type']).toBe('Question')
    expect(question.acceptedAnswer.text).toBe(getQuestion(1)!.c)
    expect(question.suggestedAnswer).toHaveLength(2)
  })

  it('escapes HTML in question text and has no app bundle (static content stays put)', () => {
    const html = renderQuestionPage({
      q: { ...getQuestion(1)!, q: 'a <b> & "c"' },
      source: null, topic: TOPIC, prev: null, next: null, origin: ORIGIN, cssHref: '/x.css',
    })
    expect(html).toContain('a &lt;b&gt; &amp; &quot;c&quot;')
    expect(html).not.toMatch(/<script type="module"/)
  })

  it('links to practising the okruh and to neighbouring questions', () => {
    const html = page(83)
    expect(html).toContain(`href="${ORIGIN}/okruh/zakon-o-zbranich/"`)
    expect(html).toContain(`href="${ORIGIN}/otazka/82/"`)
    expect(html).toContain(`href="${ORIGIN}/otazka/84/"`)
  })

  it('shows question images with alt text', () => {
    const withImg = getQuestion(649)!
    const html = renderQuestionPage({
      q: withImg, source: null, topic: TOPIC, prev: null, next: null, origin: ORIGIN, cssHref: '/x.css',
    })
    expect(html).toMatch(/<img src="\/img\/q649_0\.png" alt="[^"]+"/)
  })
})
