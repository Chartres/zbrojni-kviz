import { describe, it, expect, vi } from 'vitest'
import { runInNewContext } from 'node:vm'
import { sendPageView, beaconScript, BEACON_PATH } from './beacon.mjs'
import { renderQuestionPage } from './questionPage.mjs'
import { isAutomatedBrowser } from '@/platform/flywheel-client'
import { getQuestion } from '@/domain/questions'

const CFG = { url: 'https://abc.supabase.co', key: 'sb_publishable_x', app: 'zbrojni-kviz', botUa: /bot\b|headless/i }
const HUMAN_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'

function memStorage(init: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(init))
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  } as Storage
}

function fakeWindow(over: { webdriver?: boolean; userAgent?: string; vid?: string } = {}) {
  const fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 201 })))
  return {
    fetch,
    w: {
      navigator: { webdriver: over.webdriver ?? false, userAgent: over.userAgent ?? HUMAN_UA },
      location: { pathname: '/otazka/313/' },
      localStorage: memStorage(over.vid ? { 'fw:vid': over.vid } : {}),
      sessionStorage: memStorage(),
      crypto: { randomUUID: () => 'new-uuid' },
      fetch,
    },
  }
}

describe('static question page beacon', () => {
  it('inserts one page_view {path, static: true} into the shared events table', () => {
    const { w, fetch } = fakeWindow({ vid: 'existing-vid' })
    const row = sendPageView(w as never, CFG)
    expect(row).toMatchObject({
      app: 'zbrojni-kviz',
      event: 'page_view',
      props: { path: '/otazka/313/', static: true },
      visitor_id: 'existing-vid', // same id the app uses, so a page visitor who opens the app is one visitor
      flywheel_uid: null,
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://abc.supabase.co/rest/v1/events')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).apikey).toBe('sb_publishable_x')
    expect(JSON.parse(init.body as string)).toEqual(row)
  })

  it('creates and keeps the visitor id under fw:vid when there is none', () => {
    const { w } = fakeWindow()
    expect(sendPageView(w as never, CFG)!.visitor_id).toBe('new-uuid')
    expect(w.localStorage.getItem('fw:vid')).toBe('new-uuid')
  })

  it('sends nothing from webdriver (Playwright/CI) or a crawler user agent', () => {
    for (const over of [{ webdriver: true }, { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' }, { userAgent: 'HeadlessChrome/141' }]) {
      const { w, fetch } = fakeWindow(over)
      expect(sendPageView(w as never, CFG)).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    }
  })

  it('never throws when storage or fetch fails', () => {
    const { w } = fakeWindow()
    const broken = { getItem: () => { throw new Error('blocked') } } as unknown as Storage
    const row = sendPageView({ ...w, localStorage: broken, sessionStorage: broken, fetch: () => { throw new Error('x') } } as never, CFG)
    expect(row!.visitor_id).toBe('anon')
  })

  it('still sends when reading window.localStorage itself throws (site data blocked)', () => {
    const { w, fetch } = fakeWindow()
    const blocked = Object.defineProperty({ ...w }, 'localStorage', { get: () => { throw new DOMException('denied', 'SecurityError') } })
    expect(sendPageView(blocked as never, CFG)!.visitor_id).toBe('anon')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('the shipped file runs standalone and uses the same bot rule as flywheel-client', () => {
    const src = beaconScript({ url: 'https://abc.supabase.co/', key: 'k' })
    const { w, fetch } = fakeWindow()
    runInNewContext(src, { window: w, JSON, Date })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect((fetch.mock.calls[0] as unknown as [string])[0]).toBe('https://abc.supabase.co/rest/v1/events')

    const embedded = new RegExp(src.match(/botUa:\/(.+)\/i\}/)![1], 'i')
    for (const ua of [HUMAN_UA, 'Googlebot/2.1', 'HeadlessChrome', 'Lighthouse', 'bingpreview', 'Slurp']) {
      expect(embedded.test(ua)).toBe(isAutomatedBrowser({ userAgent: ua }))
    }
  })

  it('question pages load it only when the build has a beacon (no app bundle either way)', () => {
    const base = { q: getQuestion(1)!, source: null, topic: { slug: 's', category: 'c' }, prev: null, next: null, origin: 'https://x', cssHref: '/x.css' }
    expect(renderQuestionPage({ ...base, beaconSrc: BEACON_PATH })).toContain(`<script src="${BEACON_PATH}" defer></script>`)
    expect(renderQuestionPage(base)).not.toContain(BEACON_PATH)
    expect(renderQuestionPage({ ...base, beaconSrc: BEACON_PATH })).not.toMatch(/<script type="module"/)
  })
})
