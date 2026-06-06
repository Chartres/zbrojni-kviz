import { useEffect } from 'react'
import type { Choice, Question } from '@/domain/types'
import { imageUrl } from '@/lib/assets'

export interface QuestionCardProps {
  question: Question
  /** Whether to reveal correctness (practice/review) or hide it (exam). */
  reveal: boolean
  /** The chosen option, if the question has been answered. */
  chosen?: Choice
  bookmarked: boolean
  index: number
  total: number
  onAnswer: (choice: Choice) => void
  onNext: () => void
  onToggleBookmark: () => void
}

const OPTIONS: Choice[] = ['a', 'b', 'c']
const KEY_TO_CHOICE: Record<string, Choice> = { '1': 'a', '2': 'b', '3': 'c' }

type OptionState = 'idle' | 'correct' | 'wrong' | 'selected' | 'muted'

function optionState(
  option: Choice,
  question: Question,
  chosen: Choice | undefined,
  reveal: boolean,
): OptionState {
  if (chosen === undefined) return 'idle'
  if (reveal) {
    if (option === question.correct) return 'correct'
    if (option === chosen) return 'wrong'
    return 'muted'
  }
  return option === chosen ? 'selected' : 'muted'
}

const STATE_CLASS: Record<OptionState, string> = {
  idle: 'border-steel-700 bg-steel-800/60 hover:border-brass-500/70 hover:bg-steel-700/60',
  selected: 'border-brass-500 bg-steel-700/80 ring-1 ring-brass-500/50',
  correct: 'border-verdigris-500 bg-verdigris-500/15 text-steel-50',
  wrong: 'border-rust-500 bg-rust-500/15 text-steel-50',
  muted: 'border-steel-800 bg-steel-900/50 text-steel-400 opacity-70',
}

export function QuestionCard({
  question,
  reveal,
  chosen,
  bookmarked,
  index,
  total,
  onAnswer,
  onNext,
  onToggleBookmark,
}: QuestionCardProps) {
  const answered = chosen !== undefined
  const isCorrect = answered && chosen === question.correct

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      if (!answered && KEY_TO_CHOICE[e.key]) {
        e.preventDefault()
        onAnswer(KEY_TO_CHOICE[e.key])
      } else if (answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, onAnswer, onNext])

  return (
    <article className="mx-auto w-full max-w-2xl">
      <header className="mb-4 flex items-center justify-between text-sm text-steel-400">
        <span className="font-medium tabular-nums">
          {index + 1} / {total}
        </span>
        <span className="rounded-full border border-steel-700 px-3 py-1 text-xs uppercase tracking-wide">
          {question.cat}
        </span>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Odebrat ze záložek' : 'Přidat do záložek'}
          className={`rounded-md px-2 py-1 transition-colors ${
            bookmarked ? 'text-brass-400' : 'text-steel-500 hover:text-brass-400'
          }`}
        >
          {bookmarked ? '★' : '☆'} Záložka
        </button>
      </header>

      <h2 className="mb-5 text-balance text-xl font-semibold leading-relaxed text-steel-50">
        {question.q}
      </h2>

      {question.images.length > 0 && (
        <div className="mb-5 flex flex-wrap justify-center gap-3 rounded-lg border border-steel-800 bg-steel-50 p-4">
          {question.images.map((img) => (
            <img
              key={img}
              src={imageUrl(img)}
              alt={`Obrázek k otázce ${question.id}`}
              className="max-h-56 w-auto object-contain"
            />
          ))}
        </div>
      )}

      <div role="group" aria-label="Možnosti odpovědi" className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const state = optionState(opt, question, chosen, reveal)
          return (
            <button
              key={opt}
              type="button"
              data-state={state}
              disabled={answered}
              onClick={() => !answered && onAnswer(opt)}
              className={`flex items-start gap-3 rounded-card border px-4 py-3 text-left transition-colors disabled:cursor-default ${STATE_CLASS[state]}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-steel-600 text-xs font-bold uppercase">
                {opt}
              </span>
              <span className="leading-relaxed">{question[opt]}</span>
              {reveal && state === 'correct' && (
                <span className="ml-auto whitespace-nowrap text-xs font-semibold text-verdigris-400">
                  Správná odpověď
                </span>
              )}
            </button>
          )
        })}
      </div>

      {answered && (
        <footer className="mt-5 flex items-center justify-between gap-4">
          {reveal ? (
            <p
              className={`text-sm font-medium ${
                isCorrect ? 'text-verdigris-400' : 'text-rust-400'
              }`}
            >
              {isCorrect ? 'Správně' : 'Nesprávně'}
            </p>
          ) : (
            <span className="text-sm text-steel-400">Uloženo</span>
          )}
          <button
            type="button"
            onClick={onNext}
            className="rounded-card bg-brass-500 px-5 py-2.5 font-semibold text-steel-950 transition-colors hover:bg-brass-400"
          >
            {index + 1 === total ? 'Dokončit' : 'Další'} →
          </button>
        </footer>
      )}
    </article>
  )
}
