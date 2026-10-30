// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { fileNavigation, questionPage } from '../vite.config'

// Workbox matches the denylist against pathname + search.
describe('service worker app-shell fallback denylist', () => {
  it.each(['/sitemap.xml', '/llms.txt', '/.well-known/security.txt', '/robots.txt?x=1'])(
    'skips the shell for file %s',
    (u) => expect(fileNavigation.test(u)).toBe(true),
  )
  it.each([
    '/',
    '/?ref=news.ycombinator.com',
    '/okruh/zakon-o-zbranich/?utm_source=seznam.cz',
    '/?u=https://a.cz/x.html',
  ])('serves the shell for app route %s', (u) => expect(fileNavigation.test(u)).toBe(false))

  it('skips the shell for static question pages and /zkouska/, not for okruh pages', () => {
    expect(questionPage.test('/zkouska/')).toBe(true)
    expect(questionPage.test('/otazka/83/')).toBe(true)
    expect(questionPage.test('/okruh/zakon-o-zbranich/')).toBe(false)
  })
})
