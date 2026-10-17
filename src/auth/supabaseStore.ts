import { supabase } from './supabase'
import { normalizeProgress, type ProgressData } from '@/domain/progress'
import type { RemoteProgressStore } from './sync'

/**
 * Cloud progress backed by the fleet's shared `progress` table, keyed by
 * (user_id, app) so one account can use several kviz apps without overwriting
 * itself (see docs/SUPABASE.md for the schema + row-level-security policy).
 */
const APP = 'zbrojni'

export const supabaseStore: RemoteProgressStore = {
  async fetch(userId: string): Promise<ProgressData | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('progress')
      .select('data')
      .eq('user_id', userId)
      .eq('app', APP)
      .maybeSingle()
    if (error) throw error
    return normalizeProgress(data?.data as Partial<ProgressData> | undefined)
  },

  async save(userId: string, data: ProgressData): Promise<void> {
    if (!supabase) return
    const { error } = await supabase
      .from('progress')
      .upsert(
        { user_id: userId, app: APP, data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,app' },
      )
    if (error) throw error
  },
}
