import { useMemo } from 'react'
import { useApp } from '@/app/AppContext'
import { ALL_QUESTIONS, META } from '@/domain/questions'
import { summary } from '@/domain/progress'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function StatsScreen() {
  const { state, dispatch } = useApp()
  const sum = useMemo(() => summary(state.progress, ALL_QUESTIONS), [state.progress])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <button
        type="button"
        onClick={() => dispatch({ type: 'goMenu' })}
        className="mb-6 text-sm text-steel-400 hover:text-brass-400"
      >
        ← Zpět
      </button>
      <h1 className="mb-6 font-display text-3xl font-bold uppercase tracking-tight text-steel-50">
        Statistiky
      </h1>

      <div className="mb-8 grid grid-cols-3 gap-4 rounded-card border border-steel-700 bg-steel-800/40 p-5 text-center">
        <div>
          <div className="font-mono text-2xl font-semibold text-brass-300 tabular-nums">
            {sum.mastered}
          </div>
          <div className="text-xs uppercase tracking-wide text-steel-500">Zvládnuto</div>
        </div>
        <div>
          <div className="font-mono text-2xl font-semibold text-brass-300 tabular-nums">
            {sum.answered}
          </div>
          <div className="text-xs uppercase tracking-wide text-steel-500">Procvičeno</div>
        </div>
        <div>
          <div className="font-mono text-2xl font-semibold text-brass-300 tabular-nums">
            {Math.round(sum.accuracy * 100)}%
          </div>
          <div className="text-xs uppercase tracking-wide text-steel-500">Úspěšnost</div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-steel-400">
        Zvládnutí podle okruhů
      </h2>
      <div className="space-y-4">
        {META.categories.map((c) => {
          const b = sum.byCategory[c.name]
          return (
            <ProgressBar
              key={c.id}
              label={c.name}
              value={b ? b.mastered : 0}
              max={c.count}
              tone="verdigris"
            />
          )
        })}
      </div>
    </div>
  )
}
