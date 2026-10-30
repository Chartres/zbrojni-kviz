import type { Source } from '@/domain/sources'
import { track } from '@/analytics'

// Long lists (a whole odstavec with its písmena) fold behind a toggle so the phone screen
// keeps the question and the "Další" button in view.
const FOLD_AT = 420

// key_action {kind: source_open | source_expand, style}: the SIGNATURE.md metric for ad fontes.
// `style: 'statute'` marks events from the statute-serif setting, so its effect on how often
// learners open the source can be read against the earlier sans setting (no style prop).
const STYLE = 'statute'

export function SourceNote({ source, questionId }: { source: Source; questionId: number }) {
  const long = source.quote.length > FOLD_AT
  const head = long ? source.quote.slice(0, source.quote.lastIndexOf(' ', FOLD_AT)) + ' …' : source.quote
  return (
    <section
      aria-label={`Zdroj: ${source.label}`}
      className="mt-5 border-l-2 border-brass-500/70 bg-steel-900/60 py-3 pl-4 pr-3"
    >
      <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-steel-400">{source.heading}</p>
      <p className="statute-ref mt-1">{source.label}</p>
      {long ? (
        <details
          className="mt-2"
          onToggle={(e) => {
            if (e.currentTarget.open) track('key_action', { kind: 'source_expand', q: questionId, style: STYLE })
          }}
        >
          <summary className="cursor-pointer list-none">
            <span lang="cs" className="statute block">{head}</span>
            <span className="mt-1 block text-[0.8125rem] font-medium text-verdigris-400 underline">
              Zobrazit celé ustanovení
            </span>
          </summary>
          <p lang="cs" className="statute mt-2">{source.quote}</p>
        </details>
      ) : (
        <blockquote lang="cs" className="statute mt-1">{source.quote}</blockquote>
      )}
      <p className="statute-act mt-2">
        {source.act}.{' '}
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('key_action', { kind: 'source_open', q: questionId, style: STYLE })}
          className="whitespace-nowrap font-sans font-medium not-italic text-verdigris-400 underline hover:text-verdigris-300"
        >
          Celé znění ↗
        </a>
      </p>
    </section>
  )
}
