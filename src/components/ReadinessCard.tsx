import { useMemo } from 'react'
import { EXAM } from '@/domain/exam'
import { readiness, MIN_COVERAGE } from '@/domain/readiness'
import type { ProgressData } from '@/domain/progress'
import { ProgressBar } from '@/components/ui/ProgressBar'

const pct = (x: number) => `${Math.round(x * 100)} %`

export function ReadinessCard({ progress }: { progress: ProgressData }) {
  const r = useMemo(() => readiness(progress), [progress])
  const weakest = r.parts.find((p) => p.group === r.weakest)!
  const n = EXAM.totalQuestions
  return (
    <section
      aria-label="Připravenost na zkoušku"
      className="mb-8 rounded-card border border-steel-700 bg-steel-800/40 p-5"
    >
      <h2 className="font-mono text-[0.8125rem] font-medium uppercase tracking-[0.15em] text-steel-300">
        Připravenost na zkoušku
      </h2>

      {r.enoughData ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div data-testid="readiness-pass" className="font-mono text-3xl font-semibold text-brass-300 tabular-nums">
                {pct(r.pass)}
              </div>
              <div className="mt-1 text-[0.8125rem] text-steel-300">
                zbrojní oprávnění
                <br />
                <span className="text-steel-400">{EXAM.passThreshold} z {n}</span>
              </div>
            </div>
            <div>
              <div data-testid="readiness-pass-extended" className="font-mono text-3xl font-semibold text-brass-300 tabular-nums">
                {pct(r.passExtended)}
              </div>
              <div className="mt-1 text-[0.8125rem] text-steel-300">
                rozšířené
                <br />
                <span className="text-steel-400">{EXAM.passThresholdExtended} z {n}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-steel-200">
            Nejvíc bodů ztrácíte v části <strong className="text-steel-50">{weakest.label}</strong>{' '}
            (odhadem {weakest.expectedLost.toFixed(1).replace('.', ',')} z {weakest.count}).
          </p>
        </>
      ) : (
        <p className="mt-3 text-steel-200">
          Odhad šance na úspěch ukážeme, až procvičíte aspoň {Math.round(MIN_COVERAGE * 100)} %
          otázek z každé části testu. Dřív by to číslo nic neznamenalo.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {r.parts.map((p) => (
          <div key={p.group}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[0.8125rem]">
              <span className="text-steel-200">
                {p.label} <span className="whitespace-nowrap text-steel-400">· {p.count} v testu</span>
              </span>
              <span className="whitespace-nowrap text-steel-400 tabular-nums">
                procvičeno {pct(p.coverage)}
              </span>
            </div>
            <ProgressBar value={Math.round(p.coverage * 100)} max={100} tone="brass" />
          </div>
        ))}
      </div>

      <p className="mt-4 text-[0.8125rem] text-steel-400">
        Odhad z vašich odpovědí: zvládnutá otázka ≈ 95 %, jinak podle poměru správných pokusů;
        neviděné otázky počítáme jako 50 : 50. Test má {n} otázek ze čtyř částí v poměru{' '}
        {EXAM.composition.map((c) => c.count).join(' + ')}.
      </p>
    </section>
  )
}
