import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsScreen } from './StatsScreen'
import { emptyProgress, type ExamAttempt } from '@/domain/progress'

let examAttempts: ExamAttempt[] = []
vi.mock('@/app/AppContext', () => ({
  useApp: () => ({ state: { progress: { ...emptyProgress(), examAttempts } } }),
}))
vi.mock('@/components/ReadinessCard', () => ({ ReadinessCard: () => null }))

const attempt = (score: number, total: number, at: number): ExamAttempt => ({ at, score, total, passed: false, byCategory: {} })

describe('StatsScreen exam history', () => {
  it('shows the best attempt as a ratio, so a 26/30 is not beaten by an old 50/60', () => {
    examAttempts = [attempt(26, 30, 2), attempt(50, 60, 1)]
    render(<StatsScreen />)
    expect(screen.getByTestId('exam-best-score')).toHaveTextContent('26 / 30')
    expect(screen.queryByTestId('exam-best-old-format')).toBeNull()
  })

  it('marks a best attempt from the old 60-question test', () => {
    examAttempts = [attempt(25, 30, 2), attempt(58, 60, 1)]
    render(<StatsScreen />)
    expect(screen.getByTestId('exam-best-score')).toHaveTextContent('58 / 60')
    expect(screen.getByTestId('exam-best-old-format')).toHaveTextContent('starý test (60 otázek)')
  })
})
