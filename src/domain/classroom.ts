// Test C (2026-11-07): exam prep through instructors and clubs, with no backend.
// An instructor makes a class code on their own device. A learner enters it, then sends a summary
// of where they stand as a link: the summary travels in the URL fragment (never sent to a server),
// and opening it on the instructor's device adds the learner to the class kept there.
import { EXAM } from './exam'
import { questionsForGroup } from './questions'
import { readiness } from './readiness'
import { masteredCount, answeredCount, isMastered, statFor, type ProgressData } from './progress'
import type { ExamGroup } from './types'
import type { Rng } from './rng'
import { recentDays, type DailyState } from './daily'

/** No 0/O, 1/I/L: a code read aloud or copied by hand stays unambiguous. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LEN = 6
const GROUPS: ExamGroup[] = EXAM.composition.map((p) => p.group)
const PREFIX = 'z1.'
const MAX_NAME = 60

export function makeClassCode(rng: Rng): string {
  let out = ''
  for (let i = 0; i < CODE_LEN; i++) out += ALPHABET[Math.floor(rng() * ALPHABET.length)]
  return out
}

export function formatCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`
}

/** What a person typed → the canonical code, or null. */
export function parseCode(input: string): string | null {
  const c = input.toUpperCase().replace(/[\s-]/g, '')
  if (c.length !== CODE_LEN) return null
  return [...c].every((ch) => ALPHABET.includes(ch)) ? c : null
}

export interface PartSummary {
  g: ExamGroup
  /** Distinct questions of this part answered at least once, of `total`. */
  seen: number
  total: number
  mastered: number
  /** Estimated chance per question in this part, 0–100. */
  ch: number
}

/** [time, score, total, passed 1|0], newest first. */
export type ExamRow = [number, number, number, 0 | 1]

export interface Summary {
  v: 1
  /** Class code. */
  c: string
  /** The name the learner chose to show their instructor. */
  n: string
  /** A random id for this learner's device, so a second summary replaces the first. */
  i: string
  /** When the summary was made. */
  t: number
  answered: number
  mastered: number
  r: PartSummary[]
  /** Estimated chance of passing at 26/30 and 28/30, 0–100; ok = enough answered to say. */
  p26: number
  p28: number
  ok: boolean
  e: ExamRow[]
  /** Otázka dne in the last 7 days (answered, correct), when the learner takes part (test D). */
  q?: { a: number; c: number }
}

export interface LearnerRef {
  code: string
  name: string
  id: string
}

const pct = (x: number) => Math.round(x * 100)

export function buildSummary(
  progress: ProgressData,
  who: LearnerRef,
  now: number,
  qotd?: { daily: DailyState; today: string },
): Summary {
  const rd = readiness(progress)
  const q = qotd && qotd.daily.optedIn ? recentDays(qotd.daily, qotd.today) : null
  return {
    ...(q ? { q: { a: q.answered, c: q.correct } } : {}),
    v: 1,
    c: who.code,
    n: who.name.trim().slice(0, MAX_NAME),
    i: who.id,
    t: now,
    answered: answeredCount(progress),
    mastered: masteredCount(progress),
    r: GROUPS.map((g) => {
      const pool = questionsForGroup(g)
      const stats = pool.map((q) => statFor(progress, q.id))
      const part = rd.parts.find((p) => p.group === g)!
      return {
        g,
        seen: stats.filter((s) => s.seen > 0).length,
        total: pool.length,
        mastered: stats.filter(isMastered).length,
        ch: pct(part.chance),
      }
    }),
    p26: pct(rd.pass),
    p28: pct(rd.passExtended),
    ok: rd.enoughData,
    e: [...progress.examAttempts]
      .sort((a, b) => b.at - a.at)
      .slice(0, 5)
      .map((a) => [a.at, a.score, a.total, a.passed ? 1 : 0] as ExamRow),
  }
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeSummary(s: Summary): string {
  return PREFIX + toBase64Url(JSON.stringify(s))
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isPct = (x: unknown) => isNum(x) && x >= 0 && x <= 100

function valid(s: Summary): boolean {
  return (
    s.v === 1 &&
    typeof s.c === 'string' && parseCode(s.c) === s.c &&
    typeof s.n === 'string' && s.n.trim().length > 0 && s.n.length <= MAX_NAME &&
    typeof s.i === 'string' && s.i.length > 0 && s.i.length <= 40 &&
    isNum(s.t) && isNum(s.answered) && isNum(s.mastered) &&
    isPct(s.p26) && isPct(s.p28) && typeof s.ok === 'boolean' &&
    Array.isArray(s.r) && s.r.length === GROUPS.length &&
    s.r.every((r, k) => r && r.g === GROUPS[k] && isNum(r.seen) && isNum(r.total) && isNum(r.mastered) && isPct(r.ch)) &&
    Array.isArray(s.e) && s.e.length <= 5 &&
    s.e.every((x) => Array.isArray(x) && x.length === 4 && x.every(isNum)) &&
    (s.q === undefined ||
      (s.q && Number.isInteger(s.q.a) && Number.isInteger(s.q.c) && s.q.a >= 0 && s.q.a <= 7 && s.q.c >= 0 && s.q.c <= s.q.a))
  )
}

export function decodeSummary(token: string): Summary | null {
  if (!token.startsWith(PREFIX) || token.length > 4000) return null
  try {
    const s = JSON.parse(fromBase64Url(token.slice(PREFIX.length))) as Summary
    return s && typeof s === 'object' && valid(s) ? s : null
  } catch {
    return null
  }
}

export const INSTRUCTOR_PATH = '/instruktor/'

/** The link a learner sends: the summary rides in the fragment, which browsers never send to a server. */
export function summaryLink(origin: string, s: Summary): string {
  return `${origin}${INSTRUCTOR_PATH}#${encodeSummary(s)}`
}

/** A pasted link, fragment or bare token → the summary in it. */
export function summaryFromText(text: string): Summary | null {
  const m = /z1\.[A-Za-z0-9_-]+/.exec(text)
  return m ? decodeSummary(m[0]) : null
}

/** The link an instructor gives learners to join the class. */
export function joinLink(origin: string, code: string): string {
  return `${origin}/?trida=${formatCode(code)}`
}

export interface ClassRoom {
  code: string
  label: string
  /** The offer this class came from (docs/outreach), when the instructor arrived by its link. */
  ref: string | null
  createdAt: number
  learners: Record<string, Summary & { received: number }>
}

/** A stored class as read back from the device: drops learner entries that are not valid summaries. */
export function normalizeClass(raw: unknown): ClassRoom | null {
  const c = raw as Partial<ClassRoom> | null
  if (!c || typeof c.code !== 'string' || parseCode(c.code) !== c.code || !c.learners || typeof c.learners !== 'object') return null
  const learners: ClassRoom['learners'] = {}
  for (const [id, v] of Object.entries(c.learners)) {
    const s = v as Summary & { received: number }
    if (s && valid(s) && s.c === c.code && s.i === id) learners[id] = { ...s, received: Number(s.received) || s.t }
  }
  return {
    code: c.code,
    label: typeof c.label === 'string' ? c.label.slice(0, 60) : '',
    ref: typeof c.ref === 'string' ? c.ref : null,
    createdAt: Number(c.createdAt) || 0,
    learners,
  }
}

/** Add or update a learner; an older summary never replaces a newer one. Other classes' summaries are ignored. */
export function addToClass(room: ClassRoom, s: Summary, now: number): ClassRoom {
  if (s.c !== room.code) return room
  // A clock far ahead (or a forged time) must not pin an entry forever: no later than a day from now.
  if (s.t > now + 86_400_000) s = { ...s, t: now }
  const had = room.learners[s.i]
  if (had && had.t >= s.t) return room
  return { ...room, learners: { ...room.learners, [s.i]: { ...s, received: now } } }
}
