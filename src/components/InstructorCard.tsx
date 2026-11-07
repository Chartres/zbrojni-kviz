import { useState } from 'react'
import { track } from '@/analytics'
import { buildSummary, formatCode, parseCode, summaryLink } from '@/domain/classroom'
import type { ProgressData } from '@/domain/progress'
import { loadLearnerClass, saveLearnerClass, type LearnerClass } from '@/domain/storage'
import { clearPendingJoinCode, pendingJoinCode } from '@/lib/joinParam'

function newLearnerId(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return 'l-' + [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 10)
}

const field =
  'w-full rounded-card border border-steel-700 bg-steel-900/60 px-3 py-2.5 text-steel-100 placeholder:text-steel-500 focus:border-brass-500 focus:outline-none'
const secondary =
  'inline-flex min-h-11 items-center rounded-card border border-steel-600 px-4 font-display text-sm font-semibold uppercase tracking-wide text-steel-200 hover:border-brass-500 hover:text-brass-300'
const primary =
  'inline-flex min-h-11 items-center rounded-card bg-brass-500 px-4 font-display text-sm font-semibold uppercase tracking-wide text-steel-950 hover:bg-brass-400'

/**
 * Test C (2026-11-07): the learner's side of the class code. Join with the instructor's code, then
 * send a summary of where you stand as a link. Nothing is uploaded: the link carries the summary.
 */
export function InstructorCard({ progress, origin }: { progress: ProgressData; origin: string }) {
  const [joined, setJoined] = useState<LearnerClass | null>(loadLearnerClass)
  const pending = pendingJoinCode()
  const [editing, setEditing] = useState(joined === null || pending !== null)
  const [code, setCode] = useState(pending ?? (joined ? formatCode(joined.code) : ''))
  const [name, setName] = useState(joined?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const save = () => {
    const c = parseCode(code)
    if (!c) return setError('Kód třídy má 6 znaků, například K7Q-M2D. Zkontrolujte ho prosím.')
    if (!name.trim()) return setError('Napište jméno, podle kterého vás instruktor pozná.')
    const next = { code: c, name: name.trim().slice(0, 60), id: joined?.id ?? newLearnerId() }
    saveLearnerClass(next)
    if (!joined || joined.code !== c) track('key_action', { kind: 'class_join', class: c, via: pending ? 'link' : 'code' })
    clearPendingJoinCode()
    setJoined(next)
    setEditing(false)
    setError(null)
    setLink(null)
  }

  const send = async () => {
    if (!joined) return
    const url = summaryLink(origin, buildSummary(progress, joined, Date.now()))
    setLink(url)
    setCopied(false)
    track('key_action', { kind: 'class_send', class: joined.code })
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Zbrojní kvíz — můj postup', url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopied(true)
      }
    } catch {
      // share sheet dismissed or clipboard blocked: the link is shown below to copy by hand
    }
  }

  return (
    <section aria-labelledby="instructor-h" className="mt-6 rounded-card border border-steel-700 bg-steel-800/40 p-4">
      <h2 id="instructor-h" className="font-display text-lg font-semibold uppercase tracking-wide text-steel-50">
        Instruktor
      </h2>
      {editing || !joined ? (
        <>
          <p className="mt-1 mb-3 text-sm text-steel-400">
            Chodíte na kurz? Zadejte kód třídy od instruktora. Pak mu můžete jedním tlačítkem poslat,
            jak jste na tom. Posíláte jen odkaz; nic se nikam nenahrává.
          </p>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm text-steel-300">Kód třídy od instruktora</span>
            <input className={field} value={code} onChange={(e) => setCode(e.target.value)} placeholder="K7Q-M2D" autoCapitalize="characters" />
          </label>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm text-steel-300">Jméno pro instruktora</span>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jak vás instruktor pozná" maxLength={60} />
          </label>
          {error && (
            <p role="alert" className="mb-3 text-sm text-rust-400">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} onClick={save}>
              Uložit
            </button>
            {joined && (
              <button type="button" className={secondary} onClick={() => setEditing(false)}>
                Zrušit
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 mb-3 text-sm text-steel-300">
            Třída <span className="font-mono text-brass-300">{formatCode(joined.code)}</span> · jako{' '}
            <span className="text-steel-100">{joined.name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} onClick={send}>
              Poslat instruktorovi
            </button>
            <button type="button" className={secondary} onClick={() => setEditing(true)}>
              Změnit
            </button>
          </div>
          {link && (
            <div className="mt-3">
              <label className="block">
                <span className="mb-1 block text-sm text-steel-300">Odkaz pro instruktora</span>
                <input className={`${field} font-mono text-xs`} readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
              </label>
              <p className="mt-1 text-xs text-steel-400">
                {copied ? 'Odkaz je zkopírovaný. ' : ''}Pošlete ho instruktorovi zprávou nebo e-mailem.
                Obsahuje vaše jméno, připravenost po částech testu a výsledky testů nanečisto.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
