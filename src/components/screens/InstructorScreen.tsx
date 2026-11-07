import { useEffect, useMemo, useState } from 'react'
import { track } from '@/analytics'
import {
  addToClass,
  formatCode,
  joinLink,
  makeClassCode,
  summaryFromText,
  type ClassRoom,
  type Summary,
} from '@/domain/classroom'
import { EXAM } from '@/domain/exam'
import { makeRng, timeSeed } from '@/domain/rng'
import { loadInstructorClasses, saveInstructorClasses } from '@/domain/storage'

const field =
  'w-full rounded-card border border-steel-700 bg-steel-900/60 px-3 py-2.5 text-steel-100 placeholder:text-steel-500 focus:border-brass-500 focus:outline-none'
const primary =
  'inline-flex min-h-11 items-center rounded-card bg-brass-500 px-4 font-display text-sm font-semibold uppercase tracking-wide text-steel-950 hover:bg-brass-400'
const secondary =
  'inline-flex min-h-11 items-center rounded-card border border-steel-600 px-4 font-display text-sm font-semibold uppercase tracking-wide text-steel-200 hover:border-brass-500 hover:text-brass-300'

const PART_LABEL = Object.fromEntries(EXAM.composition.map((p) => [p.group, p.label]))
const PART_COUNT = Object.fromEntries(EXAM.composition.map((p) => [p.group, p.count]))

function refFromAddress(): string | null {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref')
    return ref && /^[a-z0-9-]{1,12}$/i.test(ref) ? ref : null
  } catch {
    return null
  }
}

function clearHash() {
  try {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
  } catch {
    // ignore
  }
}

function weakest(s: Summary): string {
  const w = s.r.reduce((a, b) => ((PART_COUNT[b.g] ?? 0) * (100 - b.ch) > (PART_COUNT[a.g] ?? 0) * (100 - a.ch) ? b : a))
  return PART_LABEL[w.g] ?? w.g
}

const day = (t: number) => new Date(t).toLocaleDateString('cs-CZ')

/**
 * Test C (2026-11-07): the instructor's page. A class code made here, learners' summaries
 * collected here, all of it kept on this device only. No account, no server.
 */
export function InstructorScreen({ origin }: { origin: string }) {
  const [classes, setClasses] = useState<ClassRoom[]>(loadInstructorClasses)
  const [label, setLabel] = useState('')
  const [paste, setPaste] = useState('')
  const [status, setStatus] = useState('')
  const [foreign, setForeign] = useState<Summary | null>(null)
  const [byDaily, setByDaily] = useState(false)
  const ref = useMemo(refFromAddress, [])

  const store = (next: ClassRoom[]) => {
    setClasses(next)
    saveInstructorClasses(next)
  }

  const receive = (s: Summary | null, current: ClassRoom[]) => {
    if (!s) {
      setStatus('Tohle není platný odkaz ze Zbrojního kvízu. Zkopírujte prosím celý odkaz od žáka.')
      return
    }
    const room = current.find((c) => c.code === s.c)
    if (!room) {
      setForeign(s)
      setStatus(`Souhrn od ${s.n} patří ke třídě ${formatCode(s.c)}, která na tomto zařízení není.`)
      return
    }
    const updated = addToClass(room, s, Date.now())
    const next = current.map((c) => (c === room ? updated : c))
    store(next)
    setForeign(null)
    setStatus(
      updated === room
        ? `${s.n}: tento souhrn už máte (nebo novější).`
        : `Přidáno: ${s.n} do třídy ${formatCode(s.c)}.`,
    )
    if (updated !== room) track('key_action', { kind: 'class_receive', class: s.c, learners: Object.keys(updated.learners).length })
  }

  // A learner's link opened on this device: take the summary from the fragment, then clean the
  // address. Also when the page is already open and only the fragment changes (same tab, installed app).
  useEffect(() => {
    const take = () => {
      if (window.location.hash.length <= 1) return
      const hash = window.location.hash
      clearHash()
      receive(summaryFromText(hash), loadInstructorClasses())
    }
    take()
    window.addEventListener('hashchange', take)
    return () => window.removeEventListener('hashchange', take)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = () => {
    const code = makeClassCode(makeRng(timeSeed()))
    const room: ClassRoom = { code, label: label.trim().slice(0, 60), ref, createdAt: Date.now(), learners: {} }
    store([room, ...classes])
    setLabel('')
    track('key_action', { kind: 'class_create', class: code, ref })
  }

  const takeOver = () => {
    if (!foreign) return
    const room: ClassRoom = { code: foreign.c, label: '', ref, createdAt: Date.now(), learners: {} }
    const next = [room, ...classes]
    receive(foreign, next)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-steel-50">Pro instruktory</h1>
      <p className="mt-2 text-sm leading-relaxed text-steel-300">
        Zdarma pro instruktory a kluby. Vytvořte kód třídy a pošlete žákům odkaz. Žáci trénují ve
        Zbrojním kvízu a tlačítkem „Poslat instruktorovi“ vám pošlou, jak jsou připravení: po částech
        testu, odhad šance uspět a výsledky testů nanečisto. Bez účtů. Souhrny se ukládají jen v tomto
        zařízení; my je nevidíme (vidíme jen anonymní počty: že třída vznikla a kolik souhrnů přišlo).
      </p>
      <p className="mt-2 text-xs leading-relaxed text-steel-400">
        Odkazy od žáků otevírejte vždy ve stejném prohlížeči (ne v okně uvnitř WhatsAppu nebo
        Messengeru), jinak třídu neuvidí. Prohlížeč může data webu po delší nečinnosti smazat; stránku
        proto otevírejte aspoň jednou týdně.
      </p>

      <p role="status" className="mt-4 min-h-[1.25rem] text-sm text-brass-300">
        {status}
      </p>
      {foreign && (
        <button type="button" className={`${secondary} mt-2`} onClick={takeOver}>
          {`Převzít třídu ${formatCode(foreign.c)} na tomto zařízení`}
        </button>
      )}

      {classes.map((room) => {
        const byName = (a: Summary, b: Summary) => a.n.localeCompare(b.n, 'cs')
        // Ranking route 1 (PRD §5.4): within this class only, from what learners sent.
        const daily = (s: Summary) => (s.q ? s.q.a * 10 + s.q.c : -1)
        const learners = Object.values(room.learners).sort((a, b) => (byDaily ? daily(b) - daily(a) : 0) || byName(a, b))
        const anyDaily = learners.some((s) => s.q)
        const link = joinLink(origin, room.code)
        return (
          <section key={room.code} aria-label={`Třída ${formatCode(room.code)}`} className="mt-6 rounded-card border border-steel-700 bg-steel-800/40 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel-400">{room.label || 'Třída'}</p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.15em] text-brass-300">{formatCode(room.code)}</p>
            <label className="mt-3 block">
              <span className="mb-1 block text-sm text-steel-300">Odkaz pro žáky</span>
              <input className={`${field} font-mono text-xs`} readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
            </label>
            <div className="mt-2">
              <button
                type="button"
                className={secondary}
                onClick={() => navigator.clipboard?.writeText(link).then(() => setStatus('Odkaz pro žáky je zkopírovaný.'), () => {})}
              >
                Kopírovat odkaz
              </button>
            </div>

            <h2 className="mt-5 font-display text-base font-semibold uppercase tracking-wide text-steel-100">
              Žáci ({learners.length})
            </h2>
            {learners.length === 0 ? (
              <p className="mt-1 text-sm text-steel-400">Zatím nikdo. Souhrny přibudou, až vám žáci pošlou odkaz.</p>
            ) : (
              <>
                {anyDaily && (
                  <button
                    type="button"
                    aria-pressed={byDaily}
                    className="mt-2 min-h-11 font-mono text-xs uppercase tracking-[0.12em] text-steel-400 hover:text-brass-300"
                    onClick={() => setByDaily((v) => !v)}
                  >
                    Řadit podle Otázky dne
                  </button>
                )}
                <ul aria-label={`Žáci třídy ${formatCode(room.code)}`} className="mt-2 divide-y divide-steel-700/70">
                  {learners.map((s) => (
                    <li key={s.i} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span data-testid="learner-name" className="min-w-0 break-words font-medium text-steel-100 [overflow-wrap:anywhere]">{s.n}</span>
                        <span className="font-mono text-xs tabular-nums text-steel-500">{day(s.t)}</span>
                      </div>
                      <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                        <dt className="text-steel-400">Procvičeno</dt>
                        <dd className="font-mono tabular-nums text-steel-200">{s.answered} / {s.r.reduce((n, r) => n + r.total, 0)}</dd>
                        <dt className="text-steel-400">Šance 26/30 · 28/30</dt>
                        <dd className="font-mono tabular-nums text-brass-300">{s.ok ? `${s.p26} % · ${s.p28} %` : '—'}</dd>
                        <dt className="text-steel-400">Nejslabší část</dt>
                        <dd className="text-steel-200">{weakest(s)}</dd>
                        {s.q && (
                          <>
                            <dt className="text-steel-400">Otázka dne (7 dní)</dt>
                            <dd className="font-mono tabular-nums text-steel-200">
                              {s.q.a}/7 · správně {s.q.c}
                            </dd>
                          </>
                        )}
                        <dt className="text-steel-400">Poslední test</dt>
                        <dd className="font-mono tabular-nums text-steel-200">
                          {s.e[0] ? `${s.e[0][1]}/${s.e[0][2]} ${s.e[0][3] ? 'prospěl(a)' : 'neprospěl(a)'}` : '—'}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-steel-500">
                  Šance se ukáže, až žák projde aspoň třetinu otázek z každé části testu.
                </p>
              </>
            )}
          </section>
        )
      })}

      <section aria-label="Přidat souhrn" className="mt-6 rounded-card border border-steel-700 bg-steel-800/40 p-4">
        <label className="block">
          <span className="mb-1 block text-sm text-steel-300">Vložte odkaz od žáka</span>
          <textarea className={`${field} font-mono text-xs`} rows={2} value={paste} onChange={(e) => setPaste(e.target.value)} />
        </label>
        <button
          type="button"
          className={`${primary} mt-2`}
          onClick={() => {
            receive(summaryFromText(paste), classes)
            setPaste('')
          }}
        >
          Přidat
        </button>
      </section>

      <section aria-label="Nová třída" className="mt-6 rounded-card border border-steel-700 bg-steel-800/40 p-4">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide text-steel-100">
          {classes.length ? 'Další třída' : 'Nová třída'}
        </h2>
        <label className="mt-2 block">
          <span className="mb-1 block text-sm text-steel-300">Název kurzu (jen pro vás)</span>
          <input className={field} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Například: kurz listopad" />
        </label>
        <button type="button" className={`${primary} mt-2`} onClick={create}>
          Vytvořit kód třídy
        </button>
      </section>

      <p className="mt-6 text-xs text-steel-500">
        <a className="text-verdigris-400 hover:underline" href="/">Zbrojní kvíz</a> je neoficiální studijní pomůcka, ne zkouška.
      </p>
    </div>
  )
}
