import { useCallback, useState } from 'react'
import { loadReadingAid, saveReadingAid } from '@/domain/storage'
import { track } from '@/analytics'
import { useApp } from '@/app/AppContext'
import { currentChoice, currentQuestion } from '@/domain/session'
import { isBookmarked } from '@/domain/progress'
import { QuestionCard } from '@/components/QuestionCard'
import { ExamTimer } from '@/components/ExamTimer'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { todayStr } from '@/lib/date'
import { caseBySlug } from '@/domain/cases'

const MODE_LABEL: Record<string, string> = {
  lesson: 'Dnešní lekce',
  practice: 'Procvičování',
  review: 'Opakování chyb',
  bookmarks: 'Záložky',
  exam: 'Zkušební test',
  weakDrill: 'Slabá místa',
  case: 'Případ',
}

export function QuizScreen() {
  const { state, dispatch } = useApp()
  const { session, mode } = state
  const onExpire = useCallback(
    () => dispatch({ type: 'finishExam', now: Date.now() }),
    [dispatch],
  )

  // Reading aid (Pavol's pick A, 2026-11-03): off by default, remembered per device.
  const [aidOn, setAidOn] = useState(loadReadingAid)
  const toggleAid = useCallback(() => {
    const next = !aidOn
    setAidOn(next)
    saveReadingAid(next)
    track('key_action', { kind: 'diff_aid', on: next })
  }, [aidOn])

  if (!session || !mode) return null
  const question = currentQuestion(session)
  const isExam = mode === 'exam'

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-steel-300">
        <p className="mb-4">Žádné otázky k zobrazení.</p>
        <button
          type="button"
          className="text-brass-400 hover:underline"
          onClick={() => dispatch({ type: 'goMenu' })}
        >
          ← Zpět na rozcestník
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'goMenu' })}
          className="text-sm text-steel-400 hover:text-brass-400"
        >
          ← Konec
        </button>
        <span className="text-xs uppercase tracking-wide text-steel-500">
          {MODE_LABEL[mode]}
        </span>
        {isExam && state.examEndsAt != null ? (
          <ExamTimer endsAt={state.examEndsAt} onExpire={onExpire} />
        ) : (
          <span className="w-12" />
        )}
      </header>

      <div className="mb-6">
        <ProgressBar value={session.index} max={session.questions.length} />
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        // Never in the mock exam: the real test prints three unmarked options.
        aid={isExam ? undefined : { on: aidOn, onToggle: toggleAid }}
        caseOf={mode === 'case' && state.caseSlug ? caseBySlug(state.caseSlug) : undefined}
        reveal={!isExam}
        chosen={currentChoice(session)}
        bookmarked={isBookmarked(state.progress, question.id)}
        index={session.index}
        total={session.questions.length}
        onAnswer={(choice) => dispatch({ type: 'answer', choice, now: Date.now() })}
        onNext={() => dispatch({ type: 'next', today: todayStr(), now: Date.now() })}
        onToggleBookmark={() =>
          dispatch({ type: 'toggleBookmark', id: question.id })
        }
      />
    </div>
  )
}
