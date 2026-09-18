import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { ResultsScreen } from './ResultsScreen'
import { emptyProgress } from '@/domain/progress'
import type { SessionState } from '@/domain/session'
import type { Question } from '@/domain/types'

const track = vi.fn()
vi.mock('@/analytics', () => ({ track: (...a: unknown[]) => track(...a), feedback: vi.fn() }))

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

vi.mock('@/app/AppContext', () => ({
  useApp: () => ({
    state: {
      session: finishedSession,
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
  beforeEach(() => track.mockClear())

  it('fires lesson_complete exactly once per completed lesson', () => {
    render(<ResultsScreen />)
    const calls = track.mock.calls.filter(([name]) => name === 'lesson_complete')
    expect(calls).toHaveLength(1)
  })
})
