import { emptyProgress, normalizeProgress, type ProgressData } from './progress'
import { normalizeRounds, type Rounds } from './round'

export const STORAGE_KEY = 'zbrojni-kviz:progress:v1'
/** Id of the account the local progress belongs to (survives reloads and sign-out). */
export const OWNER_KEY = 'zbrojni-kviz:owner'

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

export function loadProgress(): ProgressData {
  const s = storage()
  if (!s) return emptyProgress()
  try {
    const raw = s.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    return normalizeProgress(JSON.parse(raw) as Partial<ProgressData>) ?? emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(data: ProgressData): void {
  const s = storage()
  if (!s) return
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // private mode / quota exceeded — degrade gracefully to in-memory only
  }
}

export function loadOwner(): string | null {
  try {
    return storage()?.getItem(OWNER_KEY) ?? null
  } catch {
    return null
  }
}

export function saveOwner(userId: string): void {
  try {
    storage()?.setItem(OWNER_KEY, userId)
  } catch {
    // see saveProgress
  }
}

/** Unfinished rounds on this device (see round.ts). Never synced. */
export const ROUNDS_KEY = 'zbrojni-kviz:rounds:v1'

export function loadRounds(): Rounds {
  try {
    const raw = storage()?.getItem(ROUNDS_KEY)
    return raw ? normalizeRounds(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

export function saveRounds(rounds: Rounds): void {
  try {
    const s = storage()
    if (!s) return
    if (Object.keys(rounds).length === 0) s.removeItem(ROUNDS_KEY)
    else s.setItem(ROUNDS_KEY, JSON.stringify(rounds))
  } catch {
    // see saveProgress
  }
}
