import { useApp } from '@/app/AppContext'
import { score, wrongAnswers } from '@/domain/session'
import { getQuestion } from '@/domain/questions'
import { makeRng, timeSeed } from '@/domain/rng'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function ResultsScreen() {
  const { state, dispatch } = useApp()
  const { session, examResult, mode } = state
  if (!session) return null

  const total = session.questions.length
  const correct = score(session)
  const wrong = wrongAnswers(session)
  const isExam = mode === 'exam'

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="rounded-card border border-steel-700 bg-steel-800/40 p-6 text-center metal-grain">
        {isExam && examResult && (
          <div
            className={`mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wide ${
              examResult.passed
                ? 'bg-verdigris-500/20 text-verdigris-400'
                : 'bg-rust-500/20 text-rust-400'
            }`}
          >
            {examResult.passed ? 'Prospěl(a)' : 'Neprospěl(a)'}
          </div>
        )}
        <div className="text-5xl font-bold text-brass-300 tabular-nums">
          {correct}
          <span className="text-2xl text-steel-500"> / {total}</span>
        </div>
        {isExam && examResult && (
          <p className="mt-2 text-sm text-steel-400">
            Pro úspěch {examResult.passThreshold} z {total}.
          </p>
        )}
      </div>

      {isExam && examResult && (
        <section className="mt-6 space-y-3">
          {Object.entries(examResult.byCategory).map(([cat, b]) => (
            <ProgressBar
              key={cat}
              label={cat}
              value={b!.correct}
              max={b!.total}
              tone="verdigris"
            />
          ))}
        </section>
      )}

      {wrong.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rust-400">
            Chybné odpovědi ({wrong.length})
          </h2>
          <ul className="space-y-3">
            {wrong.map((r) => {
              const q = getQuestion(r.id)
              if (!q) return null
              return (
                <li
                  key={r.id}
                  className="rounded-card border border-steel-700 bg-steel-900/50 p-4"
                >
                  <p className="mb-2 text-sm text-steel-200">{q.q}</p>
                  <p className="text-sm text-verdigris-400">
                    <span className="font-semibold uppercase">{q.correct})</span>{' '}
                    {q[q.correct]}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {wrong.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'startReview', rng: makeRng(timeSeed()) })}
            className="rounded-card bg-brass-500 px-5 py-2.5 font-semibold text-steel-950 hover:bg-brass-400"
          >
            Opakovat chyby
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'goMenu' })}
          className="rounded-card border border-steel-600 px-5 py-2.5 font-semibold text-steel-200 hover:border-steel-400"
        >
          Zpět na rozcestník
        </button>
      </div>
    </div>
  )
}
