import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const insert = vi.fn(() => Promise.resolve({ error: null }))
vi.mock('./auth/supabase', () => ({ supabase: { from: () => ({ insert }) } }))

function setWebdriver(value: boolean) {
  Object.defineProperty(navigator, 'webdriver', { value, configurable: true })
}

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules()
    insert.mockClear()
  })
  afterEach(() => setWebdriver(false))

  it('sends events from a real browser', async () => {
    setWebdriver(false)
    const { track } = await import('./analytics')
    track('app_open')
    expect(insert).toHaveBeenCalled()
  })

  it('sends nothing from an automated browser (CI e2e must not pollute KPIs)', async () => {
    setWebdriver(true)
    const { track } = await import('./analytics')
    track('app_open')
    expect(insert).not.toHaveBeenCalled()
  })
})
