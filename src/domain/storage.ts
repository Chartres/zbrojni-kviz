import { emptyProgress, normalizeProgress, type ProgressData } from './progress'
import { normalizeRounds, type Rounds } from './round'
import { normalizeDaily, type DailyState } from './daily'
import { normalizeClass, type ClassRoom } from './classroom'

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

/** Reading aid "Zvýraznit rozdíly": the learner's switch, on this device. Off unless set. */
export const READING_AID_KEY = 'zbrojni-kviz:reading-aid'

export function loadReadingAid(): boolean {
  try {
    return storage()?.getItem(READING_AID_KEY) === 'on'
  } catch {
    return false
  }
}

export function saveReadingAid(on: boolean): void {
  try {
    storage()?.setItem(READING_AID_KEY, on ? 'on' : 'off')
  } catch {
    // see saveProgress
  }
}

/** Test D: Otázka dne opt-in, answers by day and the daily streak. Device only, never synced. */
export const DAILY_KEY = 'zbrojni-kviz:daily:v1'

export function loadDaily(): DailyState {
  try {
    const raw = storage()?.getItem(DAILY_KEY)
    return normalizeDaily(raw ? JSON.parse(raw) : null)
  } catch {
    return normalizeDaily(null)
  }
}

export function saveDaily(d: DailyState): void {
  try {
    storage()?.setItem(DAILY_KEY, JSON.stringify(d))
  } catch {
    // see saveProgress
  }
}

/** Test C: the class this learner joined and the name they show their instructor. Device only. */
export const CLASS_KEY = 'zbrojni-kviz:class:v1'
export interface LearnerClass {
  code: string
  name: string
  id: string
}

export function loadLearnerClass(): LearnerClass | null {
  try {
    const raw = storage()?.getItem(CLASS_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<LearnerClass>
    return typeof v.code === 'string' && typeof v.name === 'string' && typeof v.id === 'string'
      ? { code: v.code, name: v.name, id: v.id }
      : null
  } catch {
    return null
  }
}

export function saveLearnerClass(v: LearnerClass | null): void {
  try {
    const s = storage()
    if (!s) return
    if (v) s.setItem(CLASS_KEY, JSON.stringify(v))
    else s.removeItem(CLASS_KEY)
  } catch {
    // see saveProgress
  }
}

/** Test C: the instructor's classes and the summaries received, on the instructor's device only. */
export const INSTRUCTOR_KEY = 'zbrojni-kviz:instructor:v1'

export function loadInstructorClasses(): ClassRoom[] {
  try {
    const raw = storage()?.getItem(INSTRUCTOR_KEY)
    const v = raw ? (JSON.parse(raw) as { classes?: unknown }) : null
    return Array.isArray(v?.classes)
      ? v.classes.map(normalizeClass).filter((c): c is ClassRoom => c !== null)
      : []
  } catch {
    return []
  }
}

export function saveInstructorClasses(classes: ClassRoom[]): void {
  try {
    storage()?.setItem(INSTRUCTOR_KEY, JSON.stringify({ classes }))
  } catch {
    // see saveProgress
  }
}
