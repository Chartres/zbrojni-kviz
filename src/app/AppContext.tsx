import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { reducer, initialState, type AppState, type Action } from './store'
import { loadOwner, loadProgress, saveOwner, saveProgress } from '@/domain/storage'
import { emptyProgress, mergeProgress } from '@/domain/progress'
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
  // Skip the first render: state starts as initialState (empty), and the hydrate
  // effect hasn't dispatched yet — saving here would overwrite persisted localStorage.
  const persistInitialized = useRef(false)
  useEffect(() => {
    if (!persistInitialized.current) {
      persistInitialized.current = true
      return
    }
    saveProgress(state.progress)
  }, [state.progress])

  // On sign-in: reconcile local progress with the cloud and adopt the merge.
  // Sign-out keeps local progress: user=null also fires on a revoked session,
  // and wiping then would lose anything not yet uploaded.
  useEffect(() => {
    if (!user) {
      justSyncedRef.current = false
      return
    }
    // Account switch A→B: wipe A's local data before syncing B's cloud row.
    // The owner is persisted: OAuth and magic links sign in via a page reload (H4).
    const owner = loadOwner()
    if (owner !== null && owner !== user.id) {
      saveProgress(emptyProgress())
      dispatch({ type: 'hydrate', progress: emptyProgress() })
      syncInProgressRef.current = false
      justSyncedRef.current = false
    }
    saveOwner(user.id)
    let cancelled = false
    syncInProgressRef.current = true
    const local = loadProgress()
    syncProgress(supabaseStore, user.id, local).then((merged) => {
      if (!cancelled) {
        // Re-merge with the latest local state to recover any answers
        // recorded while the sync was in flight (H1).
        const latest = loadProgress()
        syncInProgressRef.current = false
        // syncProgress already uploaded `merged`; skip the next upload only if
        // nothing changed locally meanwhile, else those changes must go up too.
        justSyncedRef.current = JSON.stringify(latest) === JSON.stringify(local)
        dispatch({ type: 'hydrate', progress: mergeProgress(merged, latest) })
      }
    }).catch(() => {
      syncInProgressRef.current = false
      justSyncedRef.current = false
    })
    return () => {
      cancelled = true
      syncInProgressRef.current = false
    }
  }, [user?.id])

  // While signed in, push progress changes to the cloud (debounced). Every push
  // is fetch → merge → save (syncProgress), so a device with older state never
  // overwrites another device's progress, and a failed fetch uploads nothing.
  // Blocked while a sync is in flight and skipped once after a sync hydrate
  // to avoid uploading a pre-merge or post-merge duplicate (H1/H2/L10).
  useEffect(() => {
    if (!user) return
    if (syncInProgressRef.current) return
    if (justSyncedRef.current) {
      justSyncedRef.current = false
      return
    }
    let cancelled = false
    const local = state.progress
    const t = setTimeout(() => {
      syncProgress(supabaseStore, user.id, local).then((merged) => {
        if (cancelled || JSON.stringify(merged) === JSON.stringify(local)) return
        // Adopt what other devices added; local edits since are re-merged and
        // pushed by the next run (justSynced only when nothing changed meanwhile).
        const latest = loadProgress()
        justSyncedRef.current = JSON.stringify(latest) === JSON.stringify(local)
        dispatch({ type: 'hydrate', progress: mergeProgress(merged, latest) })
      }).catch(() => {})
    }, 1500)
    return () => {
      clearTimeout(t)
      cancelled = true
    }
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
