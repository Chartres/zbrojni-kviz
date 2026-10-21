import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultsScreen } from './ResultsScreen'
import { emptyProgress } from '@/domain/progress'
import { getQuestion } from '@/domain/questions'
import type { SessionState } from '@/domain/session'
import type { Question } from '@/domain/types'

const track = vi.fn()
const conversion = vi.fn()
vi.mock('@/analytics', () => ({
  track: (...a: unknown[]) => track(...a),
  feedback: vi.fn(),
  conversion: (...a: unknown[]) => conversion(...a),
}))

const Q: Question = {
  id: 1,
  cat: 'Nauka o zbraních',
  q: 'Test otázka?',
  a: 'a',
  b: 'b',
  c: 'c',
  correct: 'a',
  images: [],
}

const finishedSession: SessionState = {
  questions: [Q],
  index: 1,
  records: [{ id: 1, choice: 'a', correct: true }],
  chosen: { 1: 'a' },
}

let session: SessionState | null = finishedSession

vi.mock('@/app/AppContext', () => ({
  useApp: () => ({
    state: {
      session,
      examResult: null,
      mode: 'lesson',
      progress: emptyProgress(),
      selectedCategories: new Set(),
      search: '',
    },
    dispatch: vi.fn(),
  }),
}))

describe('ResultsScreen analytics', () => {
  beforeEach(() => {
    track.mockClear()
    conversion.mockClear()
    session = finishedSession
  })

  it('fires lesson_complete exactly once per completed lesson', () => {
    render(<ResultsScreen />)
    const calls = track.mock.calls.filter(([name]) => name === 'lesson_complete')
    expect(calls).toHaveLength(1)
  })

  it('fires no separate conversion event: lesson_complete is the activation KPI', () => {
    render(<ResultsScreen />)
    expect(conversion).not.toHaveBeenCalled()
  })

  it('renders nothing instead of crashing when the session is cleared', () => {
    const { rerender, container } = render(<ResultsScreen />)
    session = null
    rerender(<ResultsScreen />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists questions left unanswered at time-out with the wrong answers', () => {
    // the screen looks questions up in the real dataset by id
    const [q1, q2] = [getQuestion(1)!, getQuestion(2)!]
    session = {
      questions: [q1, q2],
      index: 1,
      records: [{ id: 1, choice: q1.correct === 'a' ? 'b' : 'a', correct: false }],
      chosen: { 1: q1.correct === 'a' ? 'b' : 'a' },
    }
    render(<ResultsScreen />)
    expect(screen.getByText(q1.q)).toBeInTheDocument()
    expect(screen.getByText(q2.q)).toBeInTheDocument()
    expect(screen.getByText('Chybné odpovědi (2)')).toBeInTheDocument()
  })

  it('fires start_* when a new session starts from the results screen (funnel stays ≤100 %)', async () => {
    const q1 = getQuestion(1)!
    const wrong = q1.correct === 'a' ? 'b' : 'a'
    session = {
      questions: [q1],
      index: 1,
      records: [{ id: 1, choice: wrong, correct: false }],
      chosen: { 1: wrong },
    }
    render(<ResultsScreen />)
    await userEvent.click(screen.getByRole('button', { name: 'Další lekce' }))
    await userEvent.click(screen.getByRole('button', { name: 'Opakovat chyby' }))
    const starts = track.mock.calls.map(([name]) => name).filter((n) => n.startsWith('start_'))
    expect(starts).toEqual(['start_lesson', 'start_review'])
  })
})
