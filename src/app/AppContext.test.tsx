import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'
import { emptyProgress, recordAnswer, type ProgressData } from '@/domain/progress'
import { saveProgress, STORAGE_KEY } from '@/domain/storage'

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
  const { state, dispatch } = useApp()
  return (
    <>
      <div data-testid="count">{Object.keys(state.progress.stats).length}</div>
      <div data-testid="bookmarks">{state.progress.bookmarks.length}</div>
      <button onClick={() => dispatch({ type: 'toggleBookmark', id: 5 })}>bookmark</button>
    </>
  )
}

// A fresh element each call: useAuth is a plain mock, so rerendering the same
// element reference would let React bail out and never see the new user.
const app = () => (
  <AppProvider>
    <Observer />
  </AppProvider>
)

// Let the syncProgress promise chain (.then / .catch) settle.
const flush = async () => {
  for (let i = 0; i < 3; i++) await Promise.resolve()
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
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

  it('does not overwrite stored progress with the empty initial state on mount', () => {
    saveProgress(recordAnswer(emptyProgress(), 7, true, 100))
    const setItem = vi.spyOn(localStorage, 'setItem')
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: null })

    render(app())

    const writtenStatCounts = setItem.mock.calls
      .filter(([key]) => key === STORAGE_KEY)
      .map(([, value]) => Object.keys(JSON.parse(value).stats).length)
    expect(writtenStatCounts).not.toContain(0)
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('wipes account A progress before syncing account B', async () => {
    vi.mocked(syncProgress).mockImplementation(async (_store, userId, local) =>
      userId === 'u1' ? recordAnswer(emptyProgress(), 99, true, 100) : local,
    )
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    const { rerender } = render(app())
    await act(flush)
    expect(screen.getByTestId('count').textContent).toBe('1')

    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u2' } })
    await act(async () => {
      rerender(app())
    })
    await act(flush)

    expect(vi.mocked(syncProgress).mock.calls[1][1]).toBe('u2')
    expect(vi.mocked(syncProgress).mock.calls[1][2].stats).toEqual({})
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('a failed sign-in sync does not block later uploads', async () => {
    vi.useFakeTimers()
    vi.mocked(syncProgress).mockRejectedValue(new Error('offline'))
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())
    await act(flush)

    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(vi.mocked(supabaseStore.save)).toHaveBeenCalledTimes(1)
  })

  it('keeps changes made while the sign-in sync is in flight', async () => {
    let finishSync!: (p: ProgressData) => void
    vi.mocked(syncProgress).mockReturnValue(
      new Promise<ProgressData>((resolve) => {
        finishSync = resolve
      }),
    )
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())

    // bookmark while the cloud round-trip is still pending
    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    await act(async () => {
      finishSync(recordAnswer(emptyProgress(), 99, true, 100))
      await flush()
    })

    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('bookmarks').textContent).toBe('1')
  })
})
