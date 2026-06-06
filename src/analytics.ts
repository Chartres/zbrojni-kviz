import { supabase } from './auth/supabase'

/**
 * Super-light, privacy-friendly usage tracking. Fire-and-forget inserts into a
 * first-party Supabase `events` table — no third party, no cookies, no PII.
 * No-ops when Supabase isn't configured (local/tests). See docs/SUPABASE.md.
 */

function id(storage: Storage | undefined, key: string): string {
  try {
    if (!storage) return 'anon'
    let v = storage.getItem(key)
    if (!v) {
      v = crypto.randomUUID()
      storage.setItem(key, v)
    }
    return v
  } catch {
    return 'anon'
  }
}

// session_id: one per browser tab session (sessionStorage).
// visitor_id: stable per browser across sessions (localStorage) → unique
// visitors and DAU/WAU/MAU.
function sessionId() {
  return id(typeof sessionStorage !== 'undefined' ? sessionStorage : undefined, 'zk:sid')
}
function visitorId() {
  return id(typeof localStorage !== 'undefined' ? localStorage : undefined, 'zk:vid')
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!supabase) return
  try {
    void supabase
      .from('events')
      .insert({
        event,
        props: props ?? {},
        session_id: sessionId(),
        visitor_id: visitorId(),
      })
      .then(
        () => {},
        () => {},
      )
  } catch {
    // never let analytics break the app
  }
}
