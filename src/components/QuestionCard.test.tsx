import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionCard } from './QuestionCard'
import type { Question } from '@/domain/types'

const Q: Question = {
  id: 1,
  cat: 'Nauka o zbraních',
  q: 'Tlumič hluku výstřelu je:',
  a: 'regulovanou součástí zbraně.',
  b: 'neregulovanou součástí zbraně.',
  c: 'doplňkem zbraně.',
  correct: 'a',
  images: [],
}

function setup(props: Partial<Parameters<typeof QuestionCard>[0]> = {}) {
  const onAnswer = vi.fn()
  const onNext = vi.fn()
  const onToggleBookmark = vi.fn()
  render(
    <QuestionCard
      question={Q}
      reveal
      bookmarked={false}
      index={0}
      total={10}
      onAnswer={onAnswer}
      onNext={onNext}
      onToggleBookmark={onToggleBookmark}
      {...props}
    />,
  )
  return { onAnswer, onNext, onToggleBookmark }
}

describe('QuestionCard', () => {
  it('renders the stem and three options', () => {
    setup()
    expect(screen.getByText('Tlumič hluku výstřelu je:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^aregulovanou součástí/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /neregulovanou/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /doplňkem/ })).toBeInTheDocument()
  })

  it('calls onAnswer with the chosen option', async () => {
    const { onAnswer } = setup()
    await userEvent.click(screen.getByRole('button', { name: /neregulovanou/ }))
    expect(onAnswer).toHaveBeenCalledWith('b')
  })

  it('supports keyboard selection (1/2/3)', async () => {
    const { onAnswer } = setup()
    await userEvent.keyboard('2')
    expect(onAnswer).toHaveBeenCalledWith('b')
  })

  it('reveals the correct answer after a wrong choice (control of error)', () => {
    setup({ chosen: 'b' })
    // the correct option is marked, regardless of what was chosen
    const correct = screen.getByRole('button', { name: /^aregulovanou součástí/ })
    expect(correct).toHaveAttribute('data-state', 'correct')
    const wrong = screen.getByRole('button', { name: /neregulovanou/ })
    expect(wrong).toHaveAttribute('data-state', 'wrong')
    expect(screen.getByText(/správná odpověď/i)).toBeInTheDocument()
  })

  it('locks options once answered', () => {
    setup({ chosen: 'a' })
    expect(screen.getByRole('button', { name: /neregulovanou/ })).toBeDisabled()
  })

  it('does NOT reveal correctness in exam mode', () => {
    setup({ chosen: 'b', reveal: false })
    const correct = screen.getByRole('button', { name: /^aregulovanou součástí/ })
    expect(correct).not.toHaveAttribute('data-state', 'correct')
    // chosen option is merely selected
    expect(screen.getByRole('button', { name: /neregulovanou/ })).toHaveAttribute(
      'data-state',
      'selected',
    )
    expect(screen.queryByText(/správná odpověď/i)).not.toBeInTheDocument()
  })

  it('toggles the bookmark', async () => {
    const { onToggleBookmark } = setup()
    await userEvent.click(screen.getByRole('button', { name: /zálož/i }))
    expect(onToggleBookmark).toHaveBeenCalled()
  })

  it('renders question images with an alt text', () => {
    setup({ question: { ...Q, images: ['q649_0.png'] } })
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', expect.stringContaining('q649_0.png'))
    expect(img).toHaveAccessibleName()
  })
})
