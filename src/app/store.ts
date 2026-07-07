import type { CategoryName, Choice } from '@/domain/types'
import type { Rng } from '@/domain/rng'
import {
  createSession,
  answerCurrent,
  advance,
  currentQuestion,
  isFinished,
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
  recordAnswer,
  recordExamAttempt,
  recordLessonComplete,
  toggleBookmark,
  type ExamAttempt,
  type ProgressData,
} from '@/domain/progress'
import { buildLesson } from '@/domain/lesson'
import { ALL_QUESTIONS } from '@/domain/questions'
import { shuffle } from '@/domain/rng'

// Bottom-tab destinations (persistent nav) + focused full-screen flows.
export type TabView = 'home' | 'practice' | 'stats' | 'guide'
export type View = TabView | 'quiz' | 'exam' | 'results'
export type Mode = 'practice' | 'review' | 'bookmarks' | 'exam' | 'lesson' | 'weakDrill'

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
  progress: ProgressData
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
    progress: emptyProgress(),
    selectedCategories: new Set(),
    search: '',
  }
}

export type Action =
  | { type: 'hydrate'; progress: ProgressData }
  | { type: 'setCategories'; categories: Set<CategoryName> }
  | { type: 'setSearch'; search: string }
  | { type: 'startLesson'; rng: Rng }
  | { type: 'startPractice'; rng: Rng }
  | { type: 'startReview'; rng: Rng }
  | { type: 'startBookmarks'; rng: Rng }
  | { type: 'startWeakDrill'; rng: Rng }
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

function begin(state: AppState, mode: Mode, questions: SessionState): AppState {
  return {
    ...state,
    mode,
    session: questions,
    examResult: null,
    view: mode === 'exam' ? 'exam' : 'quiz',
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, progress: action.progress }

    case 'setCategories':
      return { ...state, selectedCategories: action.categories }

    case 'setSearch':
      return { ...state, search: action.search }

    case 'startLesson':
      return begin(
        state,
        'lesson',
        createSession(buildLesson(state.progress, action.rng)),
      )

    case 'startPractice': {
      const qs = buildPractice(
        { categories: state.selectedCategories, search: state.search },
        action.rng,
      )
      return begin(state, 'practice', createSession(qs))
    }

    case 'startReview':
      return begin(
        state,
        'review',
        createSession(reviewQuestions(state.progress)),
      )

    case 'startBookmarks':
      return begin(
        state,
        'bookmarks',
        createSession(shuffle(bookmarkedQuestions(state.progress), action.rng)),
      )

    case 'startWeakDrill':
      return begin(
        state,
        'weakDrill',
        createSession(buildWeakDrill(ALL_QUESTIONS, state.progress, action.rng)),
      )

    case 'startExam':
      return {
        ...begin(state, 'exam', createSession(buildExam(action.rng))),
        examEndsAt: action.now + EXAM.timeLimitMinutes * 60 * 1000,
      }

    case 'answer': {
      if (!state.session) return state
      const cur = currentQuestion(state.session)
      if (!cur || state.session.chosen[cur.id] !== undefined) return state
      const session = answerCurrent(state.session, action.choice)
      const correct = action.choice === cur.correct
      return {
        ...state,
        session,
        progress: recordAnswer(state.progress, cur.id, correct, action.now),
      }
    }

    case 'next': {
      if (!state.session) return state
      const session = advance(state.session)
      if (isFinished(session)) {
        const examResult = state.mode === 'exam' ? evaluateExam(session) : null
        let progress = state.progress
        if (state.mode === 'lesson' && action.today) {
          progress = recordLessonComplete(progress, action.today)
        }
        if (examResult) {
          progress = recordExamAttempt(progress, toExamAttempt(examResult, action.now))
        }
        return {
          ...state,
          session,
          view: 'results',
          examResult,
          progress,
        }
      }
      return { ...state, session }
    }

    case 'finishExam': {
      if (!state.session) return state
      const examResult = evaluateExam(state.session)
      return {
        ...state,
        view: 'results',
        examResult,
        examEndsAt: null,
        progress: recordExamAttempt(state.progress, toExamAttempt(examResult, action.now)),
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
        examResult: null,
        examEndsAt: null,
      }

    case 'navigate':
      return { ...state, view: action.view }

    default:
      return state
  }
}
