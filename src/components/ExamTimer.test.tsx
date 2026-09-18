import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ExamTimer } from './ExamTimer'

describe('ExamTimer', () => {
  it('calls onExpire when time has already run out', () => {
    const onExpire = vi.fn()
    // endsAt in the past → remaining <= 0 on first render
    render(<ExamTimer endsAt={Date.now() - 1} onExpire={onExpire} />)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })
})
