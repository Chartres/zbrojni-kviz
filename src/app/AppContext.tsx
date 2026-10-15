import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { reducer, initialState, type AppState, type Action } from './store'
import { loadProgress, saveProgress } from '@/domain/storage'
import { emptyProgress } from '@/domain/progress'
import { topicFromPath } from '@/lib/topics'
import { makeRng, timeSeed } from '@/domain/rng'
import { useAuth } from '@/auth/AuthContext'
import { supabaseStore } from '@/auth/supabaseStore'
import { syncProgress } from '@/auth/sync'
import { track } from '@/analytics'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const { user } = useAuth()

  // True while a sign-in sync is in flight; prevents the debounced save from
  // uploading a stale local snapshot before the cloud merge lands (H1/H2).
  const syncInProgressRef = useRef(false)
  // True for exactly one render after a sync hydrate; skips the redundant
  // upload that would immediately re-trigger after the merge (H1/L10).
  const justSyncedRef = useRef(false)
  // Tracks the previous user id to distinguish a real sign-out from initial load (H3).
  const prevUserIdRef = useRef<string | undefined>(undefined)

  // Hydrate persisted progress once on mount.
  useEffect(() => {
    dispatch({ type: 'hydrate', progress: loadProgress() })
    // SEO topic page (/okruh/<slug>/): start that okruh's practice directly.
    const topic = topicFromPath(window.location.pathname)
    if (topic) {
      dispatch({ type: 'setCategories', categories: new Set([topic.category]) })
      dispatch({ type: 'startPractice', rng: makeRng(timeSeed()) })
      track('start_topic', { topic: topic.category, from: 'seo-page' })
    }
    track('app_open')
  }, [])

  // Persist progress locally whenever it changes (offline-first source of truth).
  useEffect(() => {
    saveProgress(state.progress)
  }, [state.progress])

  // On sign-in: reconcile local progress with the cloud and adopt the merge.
  // On sign-out: wipe local progress so the next account starts clean (H3).
  useEffect(() => {
    if (!user) {
      if (prevUserIdRef.current !== undefined) {
        // Real sign-out (had a user, now null).
        prevUserIdRef.current = undefined
        syncInProgressRef.current = false
        justSyncedRef.current = false
        saveProgress(emptyProgress())
        dispatch({ type: 'hydrate', progress: emptyProgress() })
      }
      return
    }
    // Account switch A→B: wipe A's local data before syncing B's cloud row.
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== user.id) {
      saveProgress(emptyProgress())
      dispatch({ type: 'hydrate', progress: emptyProgress() })
      syncInProgressRef.current = false
      justSyncedRef.current = false
    }
    prevUserIdRef.current = user.id
    let cancelled = false
    syncInProgressRef.current = true
    syncProgress(supabaseStore, user.id, loadProgress()).then((merged) => {
      if (!cancelled) {
        syncInProgressRef.current = false
        justSyncedRef.current = true
        dispatch({ type: 'hydrate', progress: merged })
      }
    })
    return () => {
      cancelled = true
      syncInProgressRef.current = false
    }
  }, [user?.id])

  // While signed in, push progress changes to the cloud (debounced).
  // Blocked while a sync is in flight and skipped once after a sync hydrate
  // to avoid uploading a pre-merge or post-merge duplicate (H1/H2/L10).
  useEffect(() => {
    if (!user) return
    if (syncInProgressRef.current) return
    if (justSyncedRef.current) {
      justSyncedRef.current = false
      return
    }
    const t = setTimeout(() => {
      supabaseStore.save(user.id, state.progress).catch(() => {})
    }, 1500)
    return () => clearTimeout(t)
  }, [state.progress, user?.id])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
