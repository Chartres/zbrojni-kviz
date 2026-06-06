import { supabase } from './auth/supabase'

/**
 * Super-light, privacy-friendly usage tracking. Fire-and-forget inserts into a
 * first-party Supabase `events` table — no third party, no cookies, no PII.
 * No-ops when Supabase isn't configured (local/tests). See docs/SUPABASE.md.
 */

function sessionId(): string {
  try {
    const key = 'zk:sid'
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!supabase) return
  try {
    void supabase
      .from('events')
      .insert({ event, props: props ?? {}, session_id: sessionId() })
      .then(
        () => {},
        () => {},
      )
  } catch {
    // never let analytics break the app
  }
}
