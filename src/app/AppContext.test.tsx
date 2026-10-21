import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'
import { emptyProgress, mergeProgress, recordAnswer, type ProgressData } from '@/domain/progress'
import { OWNER_KEY, saveProgress, STORAGE_KEY } from '@/domain/storage'

vi.mock('@/auth/sync', () => ({ syncProgress: vi.fn() }))
vi.mock('@/auth/supabaseStore', () => ({
  supabaseStore: { fetch: vi.fn(), save: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('@/auth/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('@/analytics', () => ({ track: vi.fn() }))

import { syncProgress } from '@/auth/sync'
import { supabaseStore } from '@/auth/supabaseStore'
import { useAuth } from '@/auth/AuthContext'
import { track } from '@/analytics'

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
  it('keeps local progress on sign-out', async () => {
    const synced = recordAnswer(emptyProgress(), 99, true, 100)
    vi.mocked(syncProgress).mockResolvedValue(synced)
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    const { rerender } = render(app())
    await act(flush)
    expect(screen.getByTestId('count').textContent).toBe('1')

    // sign out (explicit or a revoked session): nothing unsynced may be lost
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: null })
    await act(async () => {
      rerender(app())
    })

    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(Object.keys(JSON.parse(localStorage.getItem(STORAGE_KEY)!).stats)).toEqual(['99'])
  })

  it('signing in as another account after a sign-out starts clean', async () => {
    vi.mocked(syncProgress).mockImplementation(async (_store, userId, local) =>
      userId === 'u1' ? recordAnswer(emptyProgress(), 99, true, 100) : local,
    )
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    const { rerender } = render(app())
    await act(flush)

    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: null })
    await act(async () => {
      rerender(app())
    })
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u2' } })
    await act(async () => {
      rerender(app())
    })
    await act(flush)

    expect(vi.mocked(syncProgress).mock.calls[1][1]).toBe('u2')
    expect(vi.mocked(syncProgress).mock.calls[1][2].stats).toEqual({})
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

  it('merges with the cloud row before every upload, never blind-overwrites it', async () => {
    vi.useFakeTimers()
    // another device answered q50 after this one signed in
    const remote = recordAnswer(emptyProgress(), 50, true, 300)
    vi.mocked(syncProgress)
      .mockImplementationOnce(async (_s, _u, local) => local)
      .mockImplementation(async (_s, _u, local) => mergeProgress(local, remote))
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())
    await act(flush)

    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    await act(flush)

    expect(vi.mocked(supabaseStore.save)).not.toHaveBeenCalled()
    expect(syncProgress).toHaveBeenCalledTimes(2)
    expect(vi.mocked(syncProgress).mock.calls[1][2].bookmarks).toEqual([5])
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('bookmarks').textContent).toBe('1')
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

  it('wipes account A progress when B signs in after a page reload (OAuth/magic link)', async () => {
    vi.mocked(syncProgress).mockImplementation(async (_store, _userId, local) => local)
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    const first = render(app())
    await act(flush)
    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    first.unmount()

    // full page reload: fresh provider, B already signed in
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u2' } })
    render(app())
    await act(flush)

    expect(vi.mocked(syncProgress).mock.calls.at(-1)![1]).toBe('u2')
    expect(vi.mocked(syncProgress).mock.calls.at(-1)![2].bookmarks).toEqual([])
    expect(screen.getByTestId('bookmarks').textContent).toBe('0')
  })

  it('merges progress another tab saved instead of overwriting it', async () => {
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: null })
    render(app())
    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })

    // the other tab (PWA window) answered q99 and wrote its own snapshot
    const other = JSON.stringify(recordAnswer(emptyProgress(), 99, true, 100))
    localStorage.setItem(STORAGE_KEY, other)
    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: other }))
    })

    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('bookmarks').textContent).toBe('1')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(Object.keys(stored.stats)).toEqual(['99'])
    expect(stored.bookmarks).toEqual([5])
  })

  it('another tab signing in as a different account drops this tab\'s account A progress', async () => {
    vi.useFakeTimers()
    vi.mocked(syncProgress).mockImplementation(async (_s, userId, local) =>
      userId === 'u1' ? recordAnswer(local, 99, true, 100) : local,
    )
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())
    await act(flush)
    expect(screen.getByTestId('count').textContent).toBe('1')

    // tab B: account u2 signs in, wipes local progress, records itself as owner
    const empty = JSON.stringify(emptyProgress())
    localStorage.setItem(STORAGE_KEY, empty)
    localStorage.setItem(OWNER_KEY, 'u2')
    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: empty }))
      window.dispatchEvent(new StorageEvent('storage', { key: OWNER_KEY, newValue: 'u2' }))
    })
    // tab A's next action must not write u1's stats back for tab B to pick up
    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    await act(flush)

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).stats).toEqual({})
    expect(screen.getByTestId('count').textContent).toBe('0')
    // and u2's local progress is not uploaded into u1's cloud row
    expect(vi.mocked(syncProgress).mock.calls.filter(([, u]) => u === 'u1')).toHaveLength(1)
  })

  it('does not re-upload an answer another signed-in tab saved (that tab uploads it)', async () => {
    vi.useFakeTimers()
    vi.mocked(syncProgress).mockImplementation(async (_s, _u, local) => local)
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())
    await act(flush)
    expect(syncProgress).toHaveBeenCalledTimes(1) // sign-in sync

    const other = JSON.stringify(recordAnswer(emptyProgress(), 99, true, 100))
    localStorage.setItem(STORAGE_KEY, other)
    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: other }))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    await act(flush)

    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(syncProgress).toHaveBeenCalledTimes(1)
  })

  it('still uploads this tab\'s pending edit when another tab\'s save lacks it', async () => {
    vi.useFakeTimers()
    vi.mocked(syncProgress).mockImplementation(async (_s, _u, local) => local)
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())
    await act(flush)

    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    const other = JSON.stringify(recordAnswer(emptyProgress(), 99, true, 100))
    localStorage.setItem(STORAGE_KEY, other)
    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: other }))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    await act(flush)

    expect(syncProgress).toHaveBeenCalledTimes(2)
    const uploaded = vi.mocked(syncProgress).mock.calls.at(-1)![2]
    expect(uploaded.bookmarks).toEqual([5])
    expect(Object.keys(uploaded.stats)).toEqual(['99'])
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

    // the debounced upload goes through syncProgress (fetch → merge → save)
    expect(syncProgress).toHaveBeenCalledTimes(2)
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

  it('does not upload while the sign-in sync is in flight', async () => {
    vi.useFakeTimers()
    vi.mocked(syncProgress).mockReturnValue(new Promise<ProgressData>(() => {}))
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())

    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // an upload here would overwrite the cloud row before the merge reads it
    expect(vi.mocked(supabaseStore.save)).not.toHaveBeenCalled()
  })

  it('uploads changes made during the sync once it lands', async () => {
    vi.useFakeTimers()
    let finishSync!: (p: ProgressData) => void
    vi.mocked(syncProgress).mockReturnValue(
      new Promise<ProgressData>((resolve) => {
        finishSync = resolve
      }),
    )
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    render(app())

    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    // syncProgress already uploaded this snapshot; the bookmark is not in it
    await act(async () => {
      finishSync(recordAnswer(emptyProgress(), 99, true, 100))
      await flush()
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(syncProgress).toHaveBeenCalledTimes(2)
    const uploaded = vi.mocked(syncProgress).mock.calls[1][2]
    expect(uploaded.bookmarks).toEqual([5])
    expect(Object.keys(uploaded.stats)).toEqual(['99'])
  })

  it('ignores a sync for the previous account that lands after a switch', async () => {
    vi.useFakeTimers()
    let finishU1!: (p: ProgressData) => void
    vi.mocked(syncProgress).mockImplementation((_store, userId) =>
      userId === 'u1'
        ? new Promise<ProgressData>((resolve) => {
            finishU1 = resolve
          })
        : new Promise<ProgressData>(() => {}),
    )
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u1' } })
    const { rerender } = render(app())

    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, user: { id: 'u2' } })
    await act(async () => {
      rerender(app())
    })
    await act(async () => {
      finishU1(recordAnswer(emptyProgress(), 99, true, 100))
      await flush()
    })
    expect(screen.getByTestId('count').textContent).toBe('0')

    // u2's sync is still pending, so uploads stay blocked
    await act(async () => {
      fireEvent.click(screen.getByText('bookmark'))
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(vi.mocked(supabaseStore.save)).not.toHaveBeenCalled()
  })

  it('fires app_open only after the session is known, so it carries the identity', async () => {
    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, loading: true })
    const { rerender } = render(app())
    expect(track).not.toHaveBeenCalledWith('app_open')

    vi.mocked(useAuth).mockReturnValue({ ...baseAuth, loading: false, user: { id: 'u1' } })
    vi.mocked(syncProgress).mockResolvedValue(emptyProgress())
    await act(async () => {
      rerender(app())
    })
    await act(async () => {
      rerender(app())
    })
    expect(vi.mocked(track).mock.calls.filter(([e]) => e === 'app_open')).toHaveLength(1)
  })
})
