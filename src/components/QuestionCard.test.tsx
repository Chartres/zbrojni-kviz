import { describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionCard } from './QuestionCard'
import type { Question } from '@/domain/types'
import { ALL_QUESTIONS } from '@/domain/questions'
import { sourceFor } from '@/domain/sources'

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

  it('"Další" carries the verdict as its description, so focusing it reads the verdict', () => {
    setup({ chosen: 'b' })
    expect(screen.getByRole('button', { name: /další/i })).toHaveAccessibleDescription(/^Nesprávně/)
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

  describe('control of error: a near-miss shows exactly the words that differ', () => {
    it('marks the wrong word in the chosen option and the right word in the correct one', () => {
      setup({ chosen: 'b' })
      const wrong = screen.getByRole('button', { name: /neregulovanou/ })
      const right = screen.getByRole('button', { name: /^aregulovanou součástí/ })
      expect(wrong.querySelector('del')).toHaveTextContent('neregulovanou')
      expect(right.querySelector('ins')).toHaveTextContent('regulovanou')
      expect(screen.getByRole('status')).toHaveTextContent(/se liší ve vyznačeném/)
    })

    it('does not mark anything when the options are not near misses', () => {
      setup({ chosen: 'c' })
      expect(document.querySelector('del, ins')).toBeNull()
    })

    it('does not mark anything in exam mode', () => {
      setup({ chosen: 'b', reveal: false })
      expect(document.querySelector('del, ins')).toBeNull()
    })
  })

  describe('ad fontes: the provision the question tests', () => {
    it('after answering, quotes the provision and links to it', () => {
      setup({ chosen: 'a' })
      const src = screen.getByRole('region', { name: /zdroj/i })
      expect(src).toHaveTextContent('§ 1 odst. 1')
      expect(src).toHaveTextContent('za podmínek stanovených tímto zákonem')
      expect(screen.getByRole('link', { name: /celé znění/i })).toHaveAttribute(
        'href',
        'https://www.zakonyprolidi.cz/cs/2024-90#p1-1',
      )
    })

    it('is hidden before answering and in exam mode', () => {
      setup()
      expect(screen.queryByRole('region', { name: /zdroj/i })).toBeNull()
      cleanup()
      setup({ chosen: 'a', reveal: false })
      expect(screen.queryByRole('region', { name: /zdroj/i })).toBeNull()
    })

    it('Enter on the "full provision" toggle does not advance to the next question', async () => {
      const long = ALL_QUESTIONS.find((q) => (sourceFor(q.id)?.quote.length ?? 0) > 600)!
      const { onNext } = setup({ question: long, chosen: long.correct })
      const toggle = screen.getByText(/zobrazit celé ustanovení/i).closest('summary')!
      toggle.focus()
      await userEvent.keyboard('{Enter}')
      // the browser toggles <details> natively (jsdom doesn't); what we own is not advancing
      expect(onNext).not.toHaveBeenCalled()
    })

    it('shows nothing for a question without a confident citation', () => {
      setup({ chosen: 'a', question: { ...Q, id: 999_999 } })
      expect(screen.queryByRole('region', { name: /zdroj/i })).toBeNull()
    })
  })

  it('after answering, Enter/Space outside a control advances', async () => {
    const { onNext } = setup({ chosen: 'a' })
    screen.getByRole('heading', { name: Q.q }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onNext).toHaveBeenCalledTimes(2)
  })
})

describe('QuestionCard in a case (case method)', () => {
  it('shows the situation before answering, then the rule and the provision', async () => {
    const { caseBySlug } = await import('@/domain/cases')
    const c = caseBySlug('nutna-obrana')!
    const q = c.questions.find((x) => !sourceFor(x.id))! // an uncited question: the case provisions decide it
    setup({ question: q, caseOf: c })
    const situation = screen.getByRole('region', { name: 'Situace' })
    expect(situation).toHaveTextContent(c.situation)
    expect(screen.queryByRole('region', { name: 'Pravidlo' })).toBeNull()
    expect(screen.queryByRole('region', { name: /^Zdroj/ })).toBeNull()
    cleanup()

    setup({ question: q, caseOf: c, chosen: q.correct })
    expect(screen.getByRole('region', { name: 'Pravidlo' })).toHaveTextContent(q[q.correct])
    expect(screen.getByRole('region', { name: 'Zdroj: § 29 odst. 1' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Zdroj: § 29 odst. 2' })).toBeInTheDocument()
  })

  it('a cited case question shows its own provision, not the case ones', async () => {
    const { caseBySlug } = await import('@/domain/cases')
    const c = caseBySlug('nutna-obrana')!
    const q = c.questions.find((x) => sourceFor(x.id))!
    setup({ question: q, caseOf: c, chosen: q.correct })
    expect(screen.getAllByRole('region', { name: /^Zdroj/ })).toHaveLength(1)
    expect(screen.getByRole('region', { name: `Zdroj: ${sourceFor(q.id)!.label}` })).toBeInTheDocument()
  })

  it('reads a colon stem on into its answer as the rule', async () => {
    const { ruleOf } = await import('./QuestionCard')
    expect(ruleOf(Q)).toBe('Tlumič hluku výstřelu je regulovanou součástí zbraně.')
    expect(ruleOf({ ...Q, q: 'Je to tak?', a: 'Ano.' })).toBe('Ano.')
  })
})
