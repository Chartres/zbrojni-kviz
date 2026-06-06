import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * The app is fully usable without a backend (localStorage-only). Auth and
 * cloud sync light up only when both env vars are provided at build time.
 */
export const isAuthConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, detectSessionInUrl: true },
    })
  : null
