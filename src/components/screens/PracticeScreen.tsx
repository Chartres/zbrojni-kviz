import { useMemo } from 'react'
import { useApp } from '@/app/AppContext'
import { META } from '@/domain/questions'
import { filterQuestions } from '@/domain/selection'
import { timeSeed, makeRng } from '@/domain/rng'
import { track } from '@/analytics'
import type { CategoryName } from '@/domain/types'

export function PracticeScreen() {
  const { state, dispatch } = useApp()
  const bookmarkCount = state.progress.bookmarks.length
  const selectedCount = state.selectedCategories.size

  // Live count of what "Spustit procvičování" will serve (categories ∩ search).
  const practiceCount = useMemo(
    () =>
      filterQuestions({
        categories: state.selectedCategories,
        search: state.search,
      }).length,
    [state.selectedCategories, state.search],
  )

  function toggleCat(name: CategoryName) {
    const next = new Set(state.selectedCategories)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    dispatch({ type: 'setCategories', categories: next })
  }

  const rng = () => makeRng(timeSeed())

  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-2">
      <h1 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-steel-50">
        Procvičovat
      </h1>

      {/* MODE 1 — exam simulation */}
      <button
        type="button"
        onClick={() => {
          track('start_exam')
          dispatch({ type: 'startExam', rng: rng(), now: Date.now() })
        }}
        className="mb-5 flex w-full items-center justify-between gap-3 rounded-card border border-steel-700 bg-steel-800/40 p-4 text-left transition-colors hover:border-steel-500"
      >
        <span>
          <span className="block font-display text-lg font-semibold uppercase tracking-wide text-steel-50">
            Zkušební test
          </span>
          <span className="mt-0.5 block text-sm text-steel-400">
            60 otázek, 80 minut — jako u zkoušky.
          </span>
        </span>
        <span aria-hidden className="font-display text-brass-400">
          →
        </span>
      </button>

      {/* MODE 2 — practice by topic */}
      <section className="rounded-card border border-steel-700 bg-steel-800/40 p-4">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-steel-50">
          Procvičit okruhy
        </h2>
        <p className="mt-0.5 mb-3 text-sm text-steel-400">
          Vyberte okruhy (nic nevybráno = všechny).
        </p>
        <div className="flex flex-wrap gap-2">
          {META.categories.map((c) => {
            const active = state.selectedCategories.has(c.name)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCat(c.name)}
                aria-pressed={active}
                className={`border px-3 py-1.5 text-sm transition-colors ${
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

        <label className="mt-3 block">
          <span className="sr-only">Zúžit hledáním</span>
          <input
            type="search"
            value={state.search}
            onChange={(e) => dispatch({ type: 'setSearch', search: e.target.value })}
            placeholder="Zúžit hledáním ve znění otázek (volitelné)…"
            className="w-full rounded-card border border-steel-700 bg-steel-900/60 px-4 py-2.5 text-sm text-steel-100 placeholder:text-steel-500 focus:border-brass-500 focus:outline-none"
          />
        </label>

        <p className="mt-3 text-xs text-steel-500">
          {selectedCount === 0 ? 'Všechny okruhy' : `Vybráno okruhů: ${selectedCount}`}
          {state.search.trim() && ' · filtr hledání'} ·{' '}
          <span className="text-steel-300 tabular-nums">{practiceCount}</span> otázek
        </p>

        <button
          type="button"
          disabled={practiceCount === 0}
          onClick={() => {
            track('start_practice')
            dispatch({ type: 'startPractice', rng: rng() })
          }}
          className="glow-brass mt-3 w-full rounded-card bg-brass-500 px-5 py-3 font-display font-semibold uppercase tracking-wide text-steel-950 transition-colors hover:bg-brass-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Spustit procvičování
        </button>
      </section>

      {/* Bookmarks */}
      <button
        type="button"
        disabled={bookmarkCount === 0}
        onClick={() => {
          track('start_bookmarks')
          dispatch({ type: 'startBookmarks', rng: rng() })
        }}
        className="mt-4 flex w-full items-center justify-between rounded-card border border-steel-700 bg-steel-800/40 px-5 py-3.5 text-left transition-colors hover:border-steel-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="font-medium text-steel-100">★ Záložky</span>
        <span className="font-mono text-sm text-steel-400 tabular-nums">
          {bookmarkCount > 0 ? `${bookmarkCount} otázek →` : 'žádné'}
        </span>
      </button>
    </div>
  )
}
