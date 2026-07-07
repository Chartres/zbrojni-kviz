import { useMemo } from 'react'
import { useApp } from '@/app/AppContext'
import { ALL_QUESTIONS, META } from '@/domain/questions'
import { summary } from '@/domain/progress'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { InfoDot } from '@/components/ui/InfoDot'

export function StatsScreen() {
  const { state } = useApp()
  const sum = useMemo(() => summary(state.progress, ALL_QUESTIONS), [state.progress])
  const attempts = state.progress.examAttempts ?? []
  const bestScore = attempts.reduce((max, a) => Math.max(max, a.score), 0)

  const stats = [
    {
      testId: 'stat-mastered',
      label: 'Zvládnuto',
      value: sum.mastered,
      info: 'Otázky zodpovězené správně 2× po sobě — pak je považujeme za naučené.',
    },
    {
      testId: 'stat-answered',
      label: 'Procvičeno',
      value: sum.answered,
      info: 'Kolik různých otázek jste už alespoň jednou viděli.',
    },
    {
      testId: 'stat-accuracy',
      label: 'Úspěšnost',
      value: `${Math.round(sum.accuracy * 100)}%`,
      info: 'Podíl správných odpovědí ze všech vašich pokusů.',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-2">
      <h1 className="mb-5 font-display text-2xl font-bold uppercase tracking-tight text-steel-50">
        Statistiky
      </h1>

      <div className="mb-8 grid grid-cols-3 gap-4 rounded-card border border-steel-700 bg-steel-800/40 p-5 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <div
              data-testid={s.testId}
              className="font-mono text-2xl font-semibold text-brass-300 tabular-nums"
            >
              {s.value}
            </div>
            <div className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
              {s.label}
              <InfoDot text={s.info} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-steel-400">
        Pokrok podle okruhů
      </h2>
      <div className="space-y-5">
        {META.categories.map((c) => {
          const b = sum.byCategory[c.name]
          const seen = b ? b.seen : 0
          const mastered = b ? b.mastered : 0
          return (
            <div key={c.id}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="text-steel-200">{c.name}</span>
                <span className="font-mono text-xs text-steel-500 tabular-nums">
                  {mastered} zvládnuto · {seen} procvičeno / {c.count}
                </span>
              </div>
              {/* procvičeno (seen) as the bar; mastered shown numerically above */}
              <ProgressBar value={seen} max={c.count} tone="brass" />
            </div>
          )
        })}
      </div>

      {attempts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-steel-400">
            Zkoušky
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-card border border-steel-700 bg-steel-800/40 p-5 text-center">
            <div>
              <div
                data-testid="exam-attempt-count"
                className="font-mono text-2xl font-semibold text-brass-300 tabular-nums"
              >
                {attempts.length}
              </div>
              <div className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
                Pokusů
              </div>
            </div>
            <div>
              <div
                data-testid="exam-best-score"
                className="font-mono text-2xl font-semibold text-brass-300 tabular-nums"
              >
                {bestScore}
              </div>
              <div className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
                Nejlepší skóre
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {attempts.slice(0, 10).map((a) => (
              <li
                key={a.at}
                className="flex items-center justify-between gap-3 rounded-card border border-steel-700 bg-steel-900/50 px-4 py-2.5"
              >
                <span className="text-sm text-steel-300">
                  {new Date(a.at).toLocaleDateString('cs-CZ')}
                </span>
                <span className="font-mono text-sm text-brass-300 tabular-nums">
                  {a.score} / {a.total}
                </span>
                <span
                  className={`border px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide ${
                    a.passed
                      ? 'border-verdigris-500 text-verdigris-400'
                      : 'border-rust-500 text-rust-400'
                  }`}
                >
                  {a.passed ? 'Prospěl(a)' : 'Neprospěl(a)'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
