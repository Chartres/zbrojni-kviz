import { useMemo } from 'react'
import { useApp } from '@/app/AppContext'
import { ALL_QUESTIONS, META } from '@/domain/questions'
import { summary, needsReviewIds } from '@/domain/progress'
import { LESSON_SIZE } from '@/domain/lesson'
import { timeSeed, makeRng } from '@/domain/rng'
import { track } from '@/analytics'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { InfoDot } from '@/components/ui/InfoDot'
import type { CategoryName } from '@/domain/types'

export function MenuScreen() {
  const { state, dispatch } = useApp()
  const sum = useMemo(() => summary(state.progress, ALL_QUESTIONS), [state.progress])
  const reviewCount = useMemo(
    () => needsReviewIds(state.progress).length,
    [state.progress],
  )
  const bookmarkCount = state.progress.bookmarks.length

  function toggleCat(name: CategoryName) {
    const next = new Set(state.selectedCategories)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    dispatch({ type: 'setCategories', categories: next })
  }

  const rng = () => makeRng(timeSeed())
  const start = (type: 'startLesson' | 'startPractice' | 'startExam' | 'startReview' | 'startBookmarks') => {
    track(type.replace('start', 'start_').toLowerCase())
    if (type === 'startExam')
      dispatch({ type, rng: rng(), now: Date.now() })
    else dispatch({ type, rng: rng() })
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-10 text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-brass-400">
          Zkouška odborné způsobilosti · 2026
        </p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-steel-50 sm:text-6xl">
          Zbrojní kviz
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-steel-300">
          {META.totalQuestions} oficiálních testových otázek ke zkoušce na
          zbrojní oprávnění.
        </p>
      </header>

      {/* Progress dashboard */}
      <section className="instrument mb-6 rounded-card border border-steel-700 bg-steel-800/40 p-5 metal-grain">
        <div className="mb-4 grid grid-cols-3 gap-4 text-center">
          <Stat
            testId="stat-mastered"
            label="Zvládnuto"
            value={sum.mastered}
            suffix={`/ ${sum.total}`}
            info="Otázky zodpovězené správně 2× po sobě — pak je považujeme za naučené."
          />
          <Stat
            testId="stat-answered"
            label="Procvičeno"
            value={sum.answered}
            suffix={`/ ${sum.total}`}
            info="Kolik různých otázek jste už alespoň jednou viděli."
          />
          <Stat
            testId="stat-accuracy"
            label="Úspěšnost"
            value={Math.round(sum.accuracy * 100)}
            suffix="%"
            info="Podíl správných odpovědí ze všech vašich pokusů."
          />
        </div>
        <ProgressBar
          value={sum.mastered}
          max={sum.total}
          tone="verdigris"
          label="Celkové zvládnutí"
        />
      </section>

      {/* Daily lesson — the primary, always-finishable entry point */}
      <button
        type="button"
        onClick={() => start('startLesson')}
        className="glow-brass instrument mb-8 flex w-full items-center justify-between gap-4 rounded-card border border-brass-500/70 bg-brass-500/10 p-5 text-left transition-colors hover:bg-brass-500/20"
      >
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-brass-400">
            Dnešní lekce
          </div>
          <div className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-steel-50">
            Procvičit {LESSON_SIZE} otázek
          </div>
          <div className="mt-1 text-sm text-steel-400">
            Mix opakování a nových otázek na míru.
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div className="font-mono text-3xl font-semibold tabular-nums text-brass-300">
            {state.progress.streak.current}
          </div>
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
            {state.progress.streak.current === 1 ? 'den' : 'dní'} v řadě
          </div>
        </div>
      </button>

      {/* Categories */}
      <section className="mb-6">
        <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-steel-400">
          Okruhy
        </h2>
        <div className="flex flex-wrap gap-2">
          {META.categories.map((c) => {
            const active = state.selectedCategories.has(c.name)
            const cat = sum.byCategory[c.name]
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
                  {cat ? cat.mastered : 0}/{c.count}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-steel-500">
          {state.selectedCategories.size === 0
            ? 'Bez výběru se procvičují všechny okruhy.'
            : `Vybráno okruhů: ${state.selectedCategories.size}`}
        </p>
      </section>

      {/* Search */}
      <section className="mb-8">
        <input
          type="search"
          value={state.search}
          onChange={(e) => dispatch({ type: 'setSearch', search: e.target.value })}
          placeholder="Hledat ve znění otázek…"
          className="w-full rounded-card border border-steel-700 bg-steel-900/60 px-4 py-2.5 text-steel-100 placeholder:text-steel-500 focus:border-brass-500 focus:outline-none"
        />
      </section>

      {/* Actions */}
      <section className="grid gap-3 sm:grid-cols-2">
        <ActionCard
          title="Volné procvičování"
          desc="Vybrané okruhy s okamžitou zpětnou vazbou."
          onClick={() => start('startPractice')}
        />
        <ActionCard
          title="Zkušební test"
          desc="60 otázek, 80 minut. Uspějete od 57 správných."
          onClick={() => start('startExam')}
        />
        <ActionCard
          title="Opakovat chyby"
          desc={
            reviewCount > 0
              ? `${reviewCount} otázek k procvičení.`
              : 'Zatím žádné chyby.'
          }
          disabled={reviewCount === 0}
          onClick={() => start('startReview')}
        />
        <ActionCard
          title="Záložky"
          desc={
            bookmarkCount > 0
              ? `${bookmarkCount} otázek.`
              : 'Žádné uložené otázky.'
          }
          disabled={bookmarkCount === 0}
          onClick={() => start('startBookmarks')}
        />
      </section>

      <nav className="mt-8 flex justify-center gap-6 text-sm text-steel-400">
        <button type="button" className="hover:text-brass-400" onClick={() => dispatch({ type: 'goStudy' })}>
          Studijní průvodce
        </button>
        <button type="button" className="hover:text-brass-400" onClick={() => dispatch({ type: 'goStats' })}>
          Statistiky
        </button>
      </nav>
    </div>
  )
}

function Stat({
  label,
  value,
  suffix,
  info,
  testId,
}: {
  label: string
  value: number
  suffix?: string
  info?: string
  testId?: string
}) {
  return (
    <div>
      <div
        data-testid={testId}
        className="font-mono text-2xl font-semibold text-brass-300 tabular-nums"
      >
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-steel-500">{suffix}</span>}
      </div>
      <div className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
        {label}
        {info && <InfoDot text={info} />}
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  desc: string
  primary?: boolean
  disabled?: boolean
  onClick: () => void
}

function ActionCard({ title, desc, primary, disabled, onClick }: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-card border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? 'glow-brass border-brass-500/70 bg-brass-500/10 hover:bg-brass-500/20'
          : 'border-steel-700 bg-steel-800/40 hover:border-steel-500'
      }`}
    >
      <div className="font-display text-lg font-semibold uppercase tracking-wide text-steel-50">
        {title}
      </div>
      <div className="mt-1 text-sm text-steel-400">{desc}</div>
    </button>
  )
}
