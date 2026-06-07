import { useApp } from '@/app/AppContext'
import { META } from '@/domain/questions'
import { timeSeed, makeRng } from '@/domain/rng'
import { track } from '@/analytics'
import type { CategoryName } from '@/domain/types'

export function PracticeScreen() {
  const { state, dispatch } = useApp()
  const bookmarkCount = state.progress.bookmarks.length
  const selectedCount = state.selectedCategories.size

  function toggleCat(name: CategoryName) {
    const next = new Set(state.selectedCategories)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    dispatch({ type: 'setCategories', categories: next })
  }

  const rng = () => makeRng(timeSeed())
  const start = (type: 'startPractice' | 'startExam' | 'startBookmarks') => {
    track(type.replace('start', 'start_').toLowerCase())
    if (type === 'startExam') dispatch({ type, rng: rng(), now: Date.now() })
    else dispatch({ type, rng: rng() })
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-6">
      <h1 className="mb-5 font-display text-2xl font-bold uppercase tracking-tight text-steel-50">
        Procvičovat
      </h1>

      {/* Exam simulation — the high-stakes job */}
      <button
        type="button"
        onClick={() => start('startExam')}
        className="mb-6 block w-full rounded-card border border-steel-700 bg-steel-800/40 p-5 text-left transition-colors hover:border-steel-500"
      >
        <div className="font-display text-lg font-semibold uppercase tracking-wide text-steel-50">
          Zkušební test
        </div>
        <div className="mt-1 text-sm text-steel-400">
          60 otázek, 80 minut, jako u zkoušky. Uspějete od 57 správných.
        </div>
      </button>

      {/* Topic practice */}
      <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-steel-400">
        Procvičit okruhy
      </h2>
      <div className="flex flex-wrap gap-2">
        {META.categories.map((c) => {
          const active = state.selectedCategories.has(c.name)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCat(c.name)}
              aria-pressed={active}
              className={`border px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? 'border-brass-500 bg-brass-500/15 text-brass-300'
                  : 'border-steel-700 text-steel-300 hover:border-steel-500'
              }`}
            >
              {c.name}
              <span className="ml-2 font-mono text-xs text-steel-500 tabular-nums">
                {c.count}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-steel-500">
        {selectedCount === 0
          ? 'Bez výběru se procvičují všechny okruhy.'
          : `Vybráno okruhů: ${selectedCount}`}
      </p>

      <div className="mt-4">
        <input
          type="search"
          value={state.search}
          onChange={(e) => dispatch({ type: 'setSearch', search: e.target.value })}
          placeholder="Hledat ve znění otázek…"
          className="w-full rounded-card border border-steel-700 bg-steel-900/60 px-4 py-2.5 text-steel-100 placeholder:text-steel-500 focus:border-brass-500 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => start('startPractice')}
        className="glow-brass mt-4 w-full rounded-card bg-brass-500 px-5 py-3 font-display font-semibold uppercase tracking-wide text-steel-950 transition-colors hover:bg-brass-400"
      >
        Spustit procvičování
      </button>

      {/* Bookmarks */}
      <button
        type="button"
        disabled={bookmarkCount === 0}
        onClick={() => start('startBookmarks')}
        className="mt-3 flex w-full items-center justify-between rounded-card border border-steel-700 bg-steel-800/40 px-5 py-3.5 text-left transition-colors hover:border-steel-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="font-medium text-steel-100">Záložky</span>
        <span className="font-mono text-sm text-steel-400 tabular-nums">
          {bookmarkCount > 0 ? `${bookmarkCount} otázek →` : 'žádné'}
        </span>
      </button>
    </div>
  )
}
