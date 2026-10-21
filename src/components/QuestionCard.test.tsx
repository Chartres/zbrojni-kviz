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

  it('supports keyboard selection by letter (a/b/c, case-insensitive)', async () => {
    const { onAnswer } = setup()
    await userEvent.keyboard('c')
    expect(onAnswer).toHaveBeenCalledWith('c')
    await userEvent.keyboard('A')
    expect(onAnswer).toHaveBeenCalledWith('a')
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

  it('marks the recorded answer with aria-pressed (exam mode has no colour-only cue)', () => {
    setup({ chosen: 'b', reveal: false })
    expect(screen.getByRole('button', { name: /neregulovanou/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /doplňkem/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('moves focus to "Další" once answered instead of dropping it to <body>', async () => {
    const props = {
      question: Q, reveal: true, bookmarked: false, index: 0, total: 10,
      onAnswer: vi.fn(), onNext: vi.fn(), onToggleBookmark: vi.fn(),
    }
    const { rerender } = render(<QuestionCard {...props} />)
    screen.getByRole('button', { name: /neregulovanou/ }).focus()
    rerender(<QuestionCard {...props} chosen="b" />)
    expect(screen.getByRole('button', { name: /další/i })).toHaveFocus()
  })

  it('focuses the question heading when a new question mounts (after "Další")', () => {
    setup()
    expect(screen.getByRole('heading', { name: Q.q })).toHaveFocus()
  })

  it('announces the verdict through a status live region', () => {
    setup({ chosen: 'b' })
    expect(screen.getByRole('status')).toHaveTextContent(/^Nesprávně/)
  })

  it('announces "Uloženo" in exam mode', () => {
    setup({ chosen: 'b', reveal: false })
    expect(screen.getByRole('status')).toHaveTextContent('Uloženo')
  })

  it('after answering, Enter on a focused control activates that control, not "Další"', async () => {
    const { onNext, onToggleBookmark } = setup({ chosen: 'a' })
    screen.getByRole('button', { name: /zálož/i }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onToggleBookmark).toHaveBeenCalledTimes(1)
    expect(onNext).not.toHaveBeenCalled()
    screen.getByRole('button', { name: /další/i }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('after answering, Enter/Space outside a control advances', async () => {
    const { onNext } = setup({ chosen: 'a' })
    screen.getByRole('heading', { name: Q.q }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onNext).toHaveBeenCalledTimes(2)
  })
})
