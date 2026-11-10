import type { CategoryName, Choice, Question } from '@/domain/types'
import {
  createSession,
  answerCurrent,
  advance,
  currentQuestion,
  isCurrentAnswered,
  isFinished,
  unanswered,
  type SessionState,
} from '@/domain/session'
import {
  buildPractice,
  buildWeakDrill,
  reviewQuestions,
  bookmarkedQuestions,
} from '@/domain/selection'
import { buildExam, evaluateExam, EXAM, type ExamResult } from '@/domain/exam'
import {
  emptyProgress,
  mergeProgress,
  recordAnswer,
  recordExamAttempt,
  recordLessonComplete,
  toggleBookmark,
  type ExamAttempt,
  type ProgressData,
} from '@/domain/progress'
import { buildLesson, isFoundationPhase } from '@/domain/lesson'
import { caseBySlug } from '@/domain/cases'
import { ALL_QUESTIONS, getQuestion } from '@/domain/questions'
import { shuffle, type Rng } from '@/domain/rng'
import { answeredOn, dailyQuestionId, emptyDaily, recordDaily, type DailyState } from '@/domain/daily'
import {
  restoreSession,
  roundKey,
  snapshotRound,
  type RoundKey,
  type Rounds,
} from '@/domain/round'

// Bottom-tab destinations (persistent nav) + focused full-screen flows.
export type TabView = 'home' | 'practice' | 'stats' | 'guide'
export type View = TabView | 'quiz' | 'exam' | 'results'
export type Mode = 'practice' | 'review' | 'bookmarks' | 'exam' | 'lesson' | 'weakDrill' | 'case' | 'daily'

export const TAB_VIEWS: TabView[] = ['home', 'practice', 'stats', 'guide']
export function isTabView(v: View): v is TabView {
  return (TAB_VIEWS as string[]).includes(v)
}

export interface AppState {
  view: View
  mode: Mode | null
  session: SessionState | null
  examResult: ExamResult | null
  examEndsAt: number | null
  /** The case being worked through (mode 'case'). */
  caseSlug: string | null
  /** The running lesson is a foundation lesson (bezpečnost first). */
  foundation: boolean
  progress: ProgressData
  /** Unfinished lesson and cases on this device, to resume (round.ts). */
  rounds: Rounds
  /** Otázka dne: opt-in, answers by day and the daily streak (device only). */
  daily: DailyState
  /** The day whose question the running daily round serves. */
  dailyDay: string | null
  selectedCategories: Set<CategoryName>
  search: string
}

export function initialState(): AppState {
  return {
    view: 'home',
    mode: null,
    session: null,
    examResult: null,
    examEndsAt: null,
    caseSlug: null,
    foundation: false,
    progress: emptyProgress(),
    rounds: {},
    daily: emptyDaily(),
    dailyDay: null,
    selectedCategories: new Set(),
    search: '',
  }
}

export type Action =
  | { type: 'hydrate'; progress: ProgressData }
  | { type: 'mergeIn'; progress: ProgressData }
  | { type: 'hydrateRounds'; rounds: Rounds }
  | { type: 'hydrateDaily'; daily: DailyState }
  | { type: 'setDailyOptIn'; on: boolean }
  | { type: 'startDaily'; day: string }
  | { type: 'setCategories'; categories: Set<CategoryName> }
  | { type: 'setSearch'; search: string }
  | { type: 'startLesson'; rng: Rng }
  | { type: 'resumeLesson' }
  | { type: 'startPractice'; rng: Rng }
  | { type: 'startReview' }
  | { type: 'startBookmarks'; rng: Rng }
  | { type: 'startWeakDrill'; rng: Rng }
  | { type: 'startCase'; slug: string }
  | { type: 'startExam'; rng: Rng; now: number }
  | { type: 'answer'; choice: Choice; now: number }
  | { type: 'next'; today?: string; now: number }
  | { type: 'finishExam'; now: number }
  | { type: 'toggleBookmark'; id: number }
  | { type: 'goMenu' }
  | { type: 'navigate'; view: TabView }

function toExamAttempt(result: ExamResult, now: number): ExamAttempt {
  return {
    at: now,
    score: result.score,
    total: result.total,
    passed: result.passed,
    byCategory: result.byCategory as Record<string, { correct: number; total: number }>,
  }
}

function begin(state: AppState, mode: Mode, questions: Question[]): AppState {
  return {
    ...state,
    mode,
    session: createSession(questions),
    examResult: null,
    caseSlug: null,
    foundation: false,
    dailyDay: null,
    view: mode === 'exam' ? 'exam' : 'quiz',
  }
}

function withoutRound(rounds: Rounds, key: RoundKey): Rounds {
  if (!(key in rounds)) return rounds
  const next = { ...rounds }
  delete next[key]
  return next
}

/** The slot of the running round, if it is one that can be resumed. */
function currentRoundKey(state: AppState): RoundKey | null {
  if (state.mode === 'lesson') return 'lesson'
  if (state.mode === 'case' && state.caseSlug) return roundKey('case', state.caseSlug)
  return null
}

/** Re-open a saved round, or null when there is none (or it no longer fits the bank). */
function resume(state: AppState, key: RoundKey): AppState | null {
  const snap = state.rounds[key]
  const session = snap && restoreSession(snap)
  if (!snap || !session) return null
  return {
    ...state,
    mode: snap.mode,
    session,
    examResult: null,
    examEndsAt: null,
    caseSlug: snap.caseSlug,
    foundation: snap.foundation,
    view: 'quiz',
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, progress: action.progress }

    case 'mergeIn': {
      // Same state when nothing new arrived, so two tabs don't echo writes forever.
      const progress = mergeProgress(state.progress, action.progress)
      return JSON.stringify(progress) === JSON.stringify(state.progress)
        ? state
        : { ...state, progress }
    }

    case 'hydrateRounds':
      return { ...state, rounds: action.rounds }

    case 'hydrateDaily':
      return { ...state, daily: action.daily }

    case 'setDailyOptIn':
      return { ...state, daily: { ...state.daily, optedIn: action.on } }

    case 'startDaily': {
      // Otázka dne: the same question for everyone today; one answer a day counts.
      if (!state.daily.optedIn || answeredOn(state.daily, action.day)) return state
      const q = getQuestion(dailyQuestionId(action.day))
      if (!q) return state
      return { ...begin(state, 'daily', [q]), dailyDay: action.day }
    }

    case 'setCategories':
      return { ...state, selectedCategories: action.categories }

    case 'setSearch':
      return { ...state, search: action.search }

    case 'startLesson':
      // "Nový trénink": a new lesson replaces the unfinished one. Its answers stay in progress,
      // so the new lesson's fresh questions skip them.
      return {
        ...begin(state, 'lesson', buildLesson(state.progress, action.rng)),
        foundation: isFoundationPhase(state.progress),
        rounds: withoutRound(state.rounds, 'lesson'),
      }

    case 'resumeLesson':
      return resume(state, 'lesson') ?? { ...state, rounds: withoutRound(state.rounds, 'lesson') }

    case 'startPractice': {
      const qs = buildPractice(
        { categories: state.selectedCategories, search: state.search },
        action.rng,
        state.progress,
      )
      return begin(state, 'practice', qs)
    }

    case 'startReview':
      return begin(state, 'review', reviewQuestions(state.progress))

    case 'startBookmarks':
      return begin(
        state,
        'bookmarks',
        shuffle(bookmarkedQuestions(state.progress), action.rng),
      )

    case 'startWeakDrill':
      return begin(
        state,
        'weakDrill',
        buildWeakDrill(ALL_QUESTIONS, state.progress, action.rng),
      )

    case 'startCase': {
      // Served in the case's teaching order, not shuffled: definition, rule, then its limits.
      // A case left part-way resumes where it stopped, so its answered questions are not re-served.
      const c = caseBySlug(action.slug)
      if (!c) return state
      const resumed = resume(state, roundKey('case', c.slug))
      if (resumed) return resumed
      return { ...begin(state, 'case', c.questions), caseSlug: c.slug }
    }

    case 'startExam':
      return {
        ...begin(state, 'exam', buildExam(action.rng)),
        examEndsAt: action.now + EXAM.timeLimitMinutes * 60 * 1000,
      }

    case 'answer': {
      if (!state.session) return state
      const cur = currentQuestion(state.session)
      if (!cur || isCurrentAnswered(state.session)) return state
      const session = answerCurrent(state.session, action.choice)
      const correct = action.choice === cur.correct
      // The answer counts now, finished round or not; a lesson or case also keeps its place.
      const key = currentRoundKey(state)
      const snap =
        key &&
        snapshotRound(
          session,
          { mode: state.mode as 'lesson' | 'case', caseSlug: state.caseSlug, foundation: state.foundation },
          action.now,
        )
      return {
        ...state,
        session,
        progress: recordAnswer(state.progress, cur.id, correct, action.now),
        rounds: key && snap ? { ...state.rounds, [key]: snap } : state.rounds,
        daily:
          state.mode === 'daily' && state.dailyDay
            ? recordDaily(state.daily, state.dailyDay, correct)
            : state.daily,
      }
    }

    case 'next': {
      if (!state.session) return state
      const session = advance(state.session)
      // Otázka dne ends back home, where its card shows the result and the streak.
      if (isFinished(session) && state.mode === 'daily') {
        return { ...state, session: null, mode: null, dailyDay: null, view: 'home' }
      }
      if (isFinished(session)) {
        const examResult = state.mode === 'exam' ? evaluateExam(session) : null
        let progress = state.progress
        if (state.mode === 'lesson' && action.today) {
          progress = recordLessonComplete(progress, action.today)
        }
        if (examResult) {
          progress = recordExamAttempt(progress, toExamAttempt(examResult, action.now))
        }
        const key = currentRoundKey(state)
        return {
          ...state,
          session,
          view: 'results',
          examResult,
          progress,
          rounds: key ? withoutRound(state.rounds, key) : state.rounds,
        }
      }
      return { ...state, session }
    }

    case 'finishExam': {
      if (!state.session) return state
      const examResult = evaluateExam(state.session)
      // Unanswered at time-out count as wrong in the score, so they go to the review queue too.
      let progress = state.progress
      for (const q of unanswered(state.session)) {
        progress = recordAnswer(progress, q.id, false, action.now)
      }
      return {
        ...state,
        view: 'results',
        examResult,
        examEndsAt: null,
        progress: recordExamAttempt(progress, toExamAttempt(examResult, action.now)),
      }
    }

    case 'toggleBookmark':
      return { ...state, progress: toggleBookmark(state.progress, action.id) }

    case 'goMenu':
      return {
        ...state,
        view: 'home',
        mode: null,
        session: null,
        caseSlug: null,
        examResult: null,
        examEndsAt: null,
      }

    case 'navigate':
      return { ...state, view: action.view }

    default:
      return state
  }
}
