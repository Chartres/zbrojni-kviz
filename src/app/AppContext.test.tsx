import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'
import { emptyProgress, recordAnswer } from '@/domain/progress'

vi.mock('@/auth/sync', () => ({ syncProgress: vi.fn() }))
vi.mock('@/auth/supabaseStore', () => ({
  supabaseStore: { fetch: vi.fn(), save: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('@/auth/AuthContext', () => ({ useAuth: vi.fn() }))

import { syncProgress } from '@/auth/sync'
import { supabaseStore } from '@/auth/supabaseStore'
import { useAuth } from '@/auth/AuthContext'

const baseAuth = {
  configured: true,
  loading: false,
  user: null as null | { id: string; email?: string },
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signOut: vi.fn(),
}

function Observer() {
  const { state } = useApp()
  return <div data-testid="count">{Object.keys(state.progress.stats).length}</div>
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('AppContext sync wiring', () => {
  it('wipes progress on sign-out', async () => {
    const synced = recordAnswer(emptyProgress(), 99, true, 100)
    vi.mocked(syncProgress).mockResolvedValue(synced)
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })

    const { rerender } = render(
      <AppProvider>
        <Observer />
      </AppProvider>,
    )

    // sign in and let sync settle
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(screen.getByTestId('count').textContent).toBe('1')

    // sign out
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: null })
    await act(async () => {
      rerender(
        <AppProvider>
          <Observer />
        </AppProvider>,
      )
    })

    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('hydrates state after sign-in sync and blocks the debounced save', async () => {
    vi.useFakeTimers()

    const synced = recordAnswer(emptyProgress(), 99, true, 100)
    vi.mocked(syncProgress).mockResolvedValue(synced)
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: null })

    const { rerender } = render(
      <AppProvider>
        <Observer />
      </AppProvider>,
    )

    // pre-sign-in: 0 answered questions in state
    expect(screen.getByTestId('count').textContent).toBe('0')

    // sign in
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    await act(async () => {
      rerender(
        <AppProvider>
          <Observer />
        </AppProvider>,
      )
    })
    // flush the syncProgress promise chain — mockResolvedValue needs two microtask
    // ticks: one to resolve the promise, one to fire the .then callback in AppContext
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    // state hydrated with the synced snapshot (1 answered question)
    expect(screen.getByTestId('count').textContent).toBe('1')

    // syncProgress was called exactly once
    expect(syncProgress).toHaveBeenCalledTimes(1)

    // advance past the debounce window — no upload should have fired
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(vi.mocked(supabaseStore.save)).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
