// Reading aid wiring: off by default, the learner's choice remembered on this device, offered in
// practice and lessons, never in the mock exam. Toggling sends key_action {kind:'diff_aid'}.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { App } from '@/App'
import { READING_AID_KEY } from '@/domain/storage'

vi.mock('@/analytics', () => ({
  track: vi.fn(), identify: vi.fn(), feedback: vi.fn(), conversion: vi.fn(), logError: vi.fn(),
}))
import { track } from '@/analytics'

const aid = () => screen.queryByRole('button', { name: 'Zvýraznit rozdíly' })

beforeEach(() => {
  cleanup()
  localStorage.clear()
  vi.mocked(track).mockClear()
})

describe('reading aid in the app', () => {
  it('is off by default, remembered once turned on, and reported as a key_action', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Dnešní lekce/ }))
    expect(aid()).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(aid()!)
    expect(aid()).toHaveAttribute('aria-pressed', 'true')
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'diff_aid', on: true })
    expect(localStorage.getItem(READING_AID_KEY)).toBe('on')

    cleanup()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Pokračovat|Dnešní lekce/ }))
    expect(aid()).toHaveAttribute('aria-pressed', 'true')
  })

  it('is never offered in the mock exam, even when turned on', () => {
    localStorage.setItem(READING_AID_KEY, 'on')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Procvičovat/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Zkušební test/ }))
    expect(document.querySelector('article')).not.toBeNull()
    expect(aid()).toBeNull()
    expect(document.querySelector('[data-diff-mark]')).toBeNull()
  })
})
