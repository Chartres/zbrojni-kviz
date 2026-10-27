import type { Source } from '@/domain/sources'

// Long lists (a whole odstavec with its písmena) fold behind a toggle so the phone screen
// keeps the question and the "Další" button in view.
const FOLD_AT = 420

export function SourceNote({ source }: { source: Source }) {
  const long = source.quote.length > FOLD_AT
  const head = long ? source.quote.slice(0, source.quote.lastIndexOf(' ', FOLD_AT)) + ' …' : source.quote
  return (
    <section
      aria-label={`Zdroj: ${source.label}`}
      className="mt-5 border-l-2 border-brass-500/70 bg-steel-900/60 py-3 pl-4 pr-3"
    >
      <p className="font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-brass-300">
        Ze zákona · {source.label}
      </p>
      {long ? (
        <details className="mt-2">
          <summary className="cursor-pointer list-none leading-relaxed text-steel-200">
            <q className="quotes-none">{head}</q>
            <span className="mt-1 block text-[0.8125rem] font-medium text-verdigris-400 underline">
              Zobrazit celé ustanovení
            </span>
          </summary>
          <p className="mt-2 leading-relaxed text-steel-200">{source.quote}</p>
        </details>
      ) : (
        <blockquote className="mt-2 leading-relaxed text-steel-200">{source.quote}</blockquote>
      )}
      <p className="mt-2 text-[0.8125rem] text-steel-400">
        {source.act}.{' '}
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap font-medium text-verdigris-400 underline hover:text-verdigris-300"
        >
          Celé znění ↗
        </a>
      </p>
    </section>
  )
}
