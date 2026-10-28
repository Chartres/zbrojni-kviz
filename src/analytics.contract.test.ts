import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { ALLOWED_EVENTS } from './platform/allowed-events'

// The shared events table rejects any event name not on its insert-policy allow-list, silently
// (the client is fire-and-forget). This test fails CI when the app sends a name the database
// would drop — the way `start_weak_drill` was dropped from 2026-10-21 to 2026-10-27.

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

const SRC = join(__dirname)
const TRACK_CALL = /\btrack\(\s*['"`]([a-z_]+)['"`]/g

function sentEventNames(): Map<string, string> {
  const names = new Map<string, string>()
  for (const file of sourceFiles(SRC)) {
    for (const m of readFileSync(file, 'utf8').matchAll(TRACK_CALL)) names.set(m[1], file)
  }
  return names
}

describe('analytics contract with the shared events allow-list', () => {
  it('finds the track() calls it is meant to guard', () => {
    const names = sentEventNames()
    expect(names.has('app_open')).toBe(true)
    expect(names.has('start_lesson')).toBe(true)
  })

  it('every literal event name the app sends is on the allow-list', () => {
    const rejected = [...sentEventNames()].filter(([name]) => !ALLOWED_EVENTS.includes(name as never))
    expect(rejected).toEqual([])
  })

  it('the results screen names (lesson_complete, exam_finish, session_finish) are allowed', () => {
    for (const name of ['lesson_complete', 'exam_finish', 'session_finish']) {
      expect(ALLOWED_EVENTS).toContain(name)
    }
  })
})

describe('typed mirror vs the vendored kit allow-list (flywheel-events.json)', () => {
  // The kit file also lists names still pending a policy migration; the database drops those
  // today, so the typed mirror (what track() accepts) must stay the stricter of the two.
  it('every name track() accepts is live in the kit allow-list, none pending', async () => {
    const kit = (await import('./platform/flywheel-events.json')).default as { events: string[]; pending: string[] }
    for (const name of ALLOWED_EVENTS) {
      expect(kit.events).toContain(name)
      expect(kit.pending).not.toContain(name)
    }
  })
})
