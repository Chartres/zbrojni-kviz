import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReadinessCard } from './ReadinessCard'
import { emptyProgress, recordAnswer, MASTERY_STREAK, type ProgressData } from '@/domain/progress'
import { ALL_QUESTIONS } from '@/domain/questions'

function masterAll(): ProgressData {
  let p = emptyProgress()
  for (const q of ALL_QUESTIONS) for (let i = 0; i < MASTERY_STREAK; i++) p = recordAnswer(p, q.id, true, i)
  return p
}

describe('ReadinessCard', () => {
  it('asks for more practice instead of showing a number it cannot back', () => {
    render(<ReadinessCard progress={emptyProgress()} />)
    expect(screen.getByRole('region', { name: /připravenost/i })).toHaveTextContent(/aspoň 30 %/)
    expect(screen.queryByTestId('readiness-pass')).toBeNull()
  })

  it('shows the chance for both permit levels and how it is estimated', () => {
    render(<ReadinessCard progress={masterAll()} />)
    expect(screen.getByTestId('readiness-pass')).toHaveTextContent(/^\d{1,3} %$/)
    expect(screen.getByTestId('readiness-pass-extended')).toHaveTextContent(/^\d{1,3} %$/)
    expect(screen.getByRole('region', { name: /připravenost/i })).toHaveTextContent(/26 z 30/)
    expect(screen.getByRole('region', { name: /připravenost/i })).toHaveTextContent(/28 z 30/)
    expect(screen.getByText(/neviděné otázky počítáme jako 50/i)).toBeInTheDocument()
  })

  it('lists the four parts of the test with their coverage', () => {
    render(<ReadinessCard progress={emptyProgress()} />)
    for (const label of ['Právní předpisy', 'Nauka o zbraních a střelivu', 'Zásady bezpečného nakládání', 'Zdravotnické minimum']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })
})
