import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { ExamTimer } from './ExamTimer'

describe('ExamTimer', () => {
  it('calls onExpire when time has already run out', () => {
    const onExpire = vi.fn()
    // endsAt in the past → remaining <= 0 on first render
    render(<ExamTimer endsAt={Date.now() - 1} onExpire={onExpire} />)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  describe('expiry while mounted', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('calls onExpire exactly once when the timer ticks past zero', () => {
      const onExpire = vi.fn()
      const endsAt = Date.now() + 2000
      render(<ExamTimer endsAt={endsAt} onExpire={onExpire} />)
      expect(onExpire).not.toHaveBeenCalled()
      // Advance to 2100 ms: the 1000 ms and 2000 ms interval ticks fire;
      // remaining reaches 0 and onExpire fires. Stopping before 3000 ms
      // avoids a second tick (remaining would change to -1000 and re-fire).
      act(() => vi.advanceTimersByTime(2100))
      expect(onExpire).toHaveBeenCalledTimes(1)
    })
  })
})
