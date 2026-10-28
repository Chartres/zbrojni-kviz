import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const track = vi.fn()
vi.mock('@/analytics', () => ({ track: (...a: unknown[]) => track(...a) }))

import { SourceNote } from './SourceNote'

const SHORT = { heading: 'Ze zákona', label: '§ 1 odst. 1', act: 'Zákon č. 90/2024 Sb.', url: 'https://x/#p1-1', quote: 'Krátké ustanovení.' }
const LONG = { ...SHORT, quote: 'slovo '.repeat(120).trim() }

describe('SourceNote — measuring whether learners go to the source', () => {
  beforeEach(() => track.mockClear())

  it('opening the full text sends key_action {kind: source_open} with the question id', () => {
    render(<SourceNote source={SHORT} questionId={83} />)
    fireEvent.click(screen.getByRole('link', { name: /celé znění/i }))
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'source_open', q: 83 })
  })

  it('expanding a long provision sends key_action {kind: source_expand} once', () => {
    render(<SourceNote source={LONG} questionId={7} />)
    const details = screen.getByText(/zobrazit celé ustanovení/i).closest('details')!
    details.open = true
    fireEvent(details, new Event('toggle'))
    details.open = false
    fireEvent(details, new Event('toggle'))
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'source_expand', q: 7 })
  })
})
