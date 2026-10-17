import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PROGRESS_VERSION, emptyStreak } from '@/domain/progress'

// vi.hoisted ensures this runs before the vi.mock factory below.
const mockRow = vi.hoisted(() => ({ current: null as unknown }))
const eqCalls = vi.hoisted(() => [] as unknown[][])

vi.mock('./supabase', () => {
  const chain: Record<string, unknown> = {}
  chain['eq'] = (...args: unknown[]) => { eqCalls.push(args); return chain }
  chain['select'] = () => chain
  chain['maybeSingle'] = async () => ({
    data: mockRow.current ? { data: mockRow.current } : null,
    error: null,
  })
  return { supabase: { from: () => chain } }
})

import { supabaseStore } from './supabaseStore'

describe('supabaseStore.fetch', () => {
  beforeEach(() => { mockRow.current = null; eqCalls.length = 0 })

  it('returns null when stored version does not match PROGRESS_VERSION', async () => {
    mockRow.current = { version: PROGRESS_VERSION + 1 }
    expect(await supabaseStore.fetch('u1')).toBeNull()
  })

  it('returns null when row is missing', async () => {
    mockRow.current = null
    expect(await supabaseStore.fetch('u1')).toBeNull()
    // eq filter must include the app-isolation clause so a missing filter is caught
    expect(eqCalls).toContainEqual(['app', 'zbrojni'])
  })

  it('normalizes missing fields and returns progress on version match', async () => {
    mockRow.current = { version: PROGRESS_VERSION }
    const result = await supabaseStore.fetch('u1')
    expect(result).not.toBeNull()
    expect(result!.stats).toEqual({})
    expect(result!.bookmarks).toEqual([])
    expect(result!.streak).toEqual(emptyStreak())
    expect(result!.examAttempts).toEqual([])
  })
})
