// Test D on the home screen: opt in, answer today's question, see it done with the streak; the
// choice and streak survive a reload; key_action events carry the metric (no new names).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { App } from '@/App'
import { DAILY_KEY } from '@/domain/storage'
import { dailyQuestionId } from '@/domain/daily'
import { getQuestion } from '@/domain/questions'
import { todayStr } from '@/lib/date'

vi.mock('@/analytics', () => ({
  track: vi.fn(), identify: vi.fn(), feedback: vi.fn(), conversion: vi.fn(), logError: vi.fn(),
}))
import { track } from '@/analytics'

beforeEach(() => {
  cleanup()
  localStorage.clear()
  vi.mocked(track).mockClear()
  window.history.replaceState(null, '', '/')
})

describe('Otázka dne on the home screen', () => {
  it('is opt-in: offered, not started', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: 'Otázka dne' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Zapojit se' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Odpovědět/ })).toBeNull()
  })

  it('opt in, answer, back home: done for today with the streak; remembered after reload', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Zapojit se' }))
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'qotd_optin' })
    fireEvent.click(screen.getByRole('button', { name: /Odpovědět/ }))
    const day = todayStr()
    const q = getQuestion(dailyQuestionId(day))!
    expect(screen.getByRole('heading', { level: 2, name: q.q.trim() })).toBeTruthy()
    fireEvent.click(document.querySelectorAll('button[data-state="idle"]')[['a', 'b', 'c'].indexOf(q.correct)])
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'qotd_answer', day, correct: true, streak: 1 })
    fireEvent.click(screen.getByRole('button', { name: /^Dokončit/ }))

    expect(screen.getByText(/Dnes hotovo/)).toBeTruthy()
    expect(screen.getByText(/1 den v řadě/)).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(DAILY_KEY)!).days[day]).toBe(1)

    cleanup()
    render(<App />)
    expect(screen.getByText(/Dnes hotovo/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Odpovědět/ })).toBeNull()
  })

  it('can be switched off again', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Zapojit se' }))
    fireEvent.click(screen.getByRole('button', { name: 'Vypnout' }))
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'qotd_optout' })
    expect(screen.getByRole('button', { name: 'Zapojit se' })).toBeTruthy()
  })
})
