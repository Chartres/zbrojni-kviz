import { useApp } from '@/app/AppContext'
import { track } from '@/analytics'
import { answeredOn, liveDailyStreak } from '@/domain/daily'
import { todayStr } from '@/lib/date'

const btn =
  'inline-flex min-h-11 items-center rounded-card px-4 font-display text-sm font-semibold uppercase tracking-wide'

const days = (n: number) => (n === 1 ? 'den' : n >= 2 && n <= 4 ? 'dny' : 'dní')

/**
 * Test D (2026-11-07): Otázka dne. Opt-in; the same question for everyone today; the streak lives
 * on this device and never nags (a missed day just starts it again).
 */
export function DailyCard() {
  const { state, dispatch } = useApp()
  const today = todayStr()
  const d = state.daily
  const streak = liveDailyStreak(d, today)
  const done = answeredOn(d, today)

  return (
    <section aria-labelledby="daily-h" className="mb-3 rounded-card border border-steel-700 bg-steel-800/40 px-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="daily-h" className="font-mono text-xs uppercase tracking-[0.2em] text-brass-400">
          Otázka dne
        </h2>
        {d.optedIn && streak > 0 && (
          <span className="font-mono text-xs tabular-nums text-steel-400">
            {streak} {days(streak)} v řadě
          </span>
        )}
      </div>

      {!d.optedIn ? (
        <>
          <p className="mt-1 text-sm text-steel-300">
            Každý den jedna otázka, pro všechny stejná. Krátká denní rozcvička; počítadlo dní je jen ve
            vašem telefonu.
          </p>
          <button
            type="button"
            className={`${btn} mt-3 border border-steel-600 text-steel-200 hover:border-brass-500 hover:text-brass-300`}
            onClick={() => {
              dispatch({ type: 'setDailyOptIn', on: true })
              track('key_action', { kind: 'qotd_optin' })
            }}
          >
            Zapojit se
          </button>
        </>
      ) : done ? (
        <p className="mt-1 text-sm text-steel-300">
          Dnes hotovo {d.days[today] ? '· správně' : '· tentokrát vedle, otázka půjde do opakování'}. Zítra
          další.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={`${btn} bg-brass-500 text-steel-950 hover:bg-brass-400`}
            onClick={() => dispatch({ type: 'startDaily', day: today })}
          >
            Odpovědět →
          </button>
          <span className="text-sm text-steel-400">Jedna otázka, pár vteřin.</span>
        </div>
      )}

      {d.optedIn && (
        <button
          type="button"
          className="mt-2 min-h-11 text-xs text-steel-500 underline-offset-2 hover:text-steel-300 hover:underline"
          onClick={() => {
            dispatch({ type: 'setDailyOptIn', on: false })
            track('key_action', { kind: 'qotd_optout' })
          }}
        >
          Vypnout
        </button>
      )}
    </section>
  )
}
