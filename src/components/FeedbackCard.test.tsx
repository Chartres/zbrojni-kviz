import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackCard } from './FeedbackCard'

const feedback = vi.fn()
vi.mock('@/analytics', () => ({ feedback: (...a: unknown[]) => feedback(...a) }))

describe('FeedbackCard', () => {
  beforeEach(() => feedback.mockClear())

  it('is collapsed by default and expands on click', async () => {
    render(<FeedbackCard />)
    expect(screen.queryByLabelText('Zpětná vazba')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /napiš autorovi/i }))
    expect(screen.getByLabelText('Zpětná vazba')).toBeInTheDocument()
  })

  it('sends the Sean Ellis choice + text (prefixed with context) and thanks the user', async () => {
    render(<FeedbackCard context="exam" />)
    await userEvent.click(screen.getByRole('button', { name: /napiš autorovi/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Hodně by mi chybělo' }))
    await userEvent.type(screen.getByLabelText('Zpětná vazba'), 'chybí tmavý režim')
    await userEvent.click(screen.getByRole('button', { name: 'Odeslat' }))

    expect(feedback).toHaveBeenCalledWith({
      sean_ellis: 'very',
      text: '[exam] chybí tmavý režim',
    })
    expect(screen.getByText(/Díky/)).toBeInTheDocument()
  })

  it('will not send when nothing is entered', async () => {
    render(<FeedbackCard />)
    await userEvent.click(screen.getByRole('button', { name: /napiš autorovi/i }))
    expect(screen.getByRole('button', { name: 'Odeslat' })).toBeDisabled()
  })
})
