// The unfinished lesson on the home screen: Pokračovat resumes at the first unanswered question,
// Nový trénink replaces it, the round survives a reload, and the completion events go out only
// when a round is finished (no new event names).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { App } from '@/App'
import { loadRounds, ROUNDS_KEY } from '@/domain/storage'

vi.mock('@/analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
  feedback: vi.fn(),
  conversion: vi.fn(),
  logError: vi.fn(),
}))
import { track } from '@/analytics'

const counter = () => document.querySelector('article header span')?.textContent
const names = () => vi.mocked(track).mock.calls.map((c) => c[0])

function answerOne() {
  fireEvent.click(document.querySelector('button[data-state="idle"]')!)
  fireEvent.click(screen.getByRole('button', { name: /^(Další|Dokončit)/ }))
}

beforeEach(() => {
  cleanup()
  localStorage.clear()
  vi.mocked(track).mockClear()
})

describe('home: unfinished lesson', () => {
  it('leave at 8, reload, Pokračovat at 9, finish: lesson_complete once, round gone', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Dnešní lekce/ }))
    for (let i = 0; i < 8; i++) answerOne()
    fireEvent.click(screen.getByRole('button', { name: /Konec/ }))
    expect(names()).not.toContain('lesson_complete')
    expect(loadRounds().lesson?.records).toHaveLength(8)

    // a fresh page load on the same device
    cleanup()
    render(<App />)
    expect(screen.getByText('Rozpracovaná lekce')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /8 \/ 12 zodpovězeno/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Pokračovat/ }))
    expect(track).toHaveBeenCalledWith('start_lesson', { resume: true, foundation: true })
    expect(counter()).toBe('09 / 12')

    for (let i = 0; i < 4; i++) answerOne()
    expect(screen.getByText('Lekce dokončena')).toBeTruthy()
    const done = vi.mocked(track).mock.calls.filter((c) => c[0] === 'lesson_complete')
    expect(done).toHaveLength(1)
    expect(done[0][1]).toMatchObject({ mode: 'lesson', total: 12 })
    expect(localStorage.getItem(ROUNDS_KEY)).toBeNull()
  })

  it('Nový trénink replaces the unfinished lesson', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Dnešní lekce/ }))
    answerOne()
    fireEvent.click(screen.getByRole('button', { name: /Konec/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Nový trénink' }))
    expect(track).toHaveBeenLastCalledWith('start_lesson', { foundation: true, replaced: true })
    expect(counter()).toBe('01 / 12')
    expect(loadRounds().lesson).toBeUndefined()
  })
})
