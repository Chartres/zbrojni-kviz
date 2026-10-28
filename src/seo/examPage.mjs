// /zkouska/ — "how the exam works", one static page readable without JavaScript. Every answer
// is followed by the provision it rests on, quoted from the parsed act (data/law/*.json), so the
// page can't drift from the law it cites. Plain JS for vitest and scripts/prerender.mjs alike.

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/**
 * @param {Record<string, { name: string, url: string, units: { id: string, label: string, anchor: string, text: string, parent: string | null }[] }>} acts
 * @param {{ act: string, unit: string, whole?: boolean }} cite
 */
export function resolveQuote(acts, { act, unit, whole = false }) {
  const a = acts[act]
  if (!a) throw new Error(`unknown act ${act}`)
  const byId = new Map(a.units.map((u) => [u.id, u]))
  const u = byId.get(unit)
  if (!u) throw new Error(`unknown provision ${act} ${unit}`)
  const kids = (id) => a.units.filter((k) => k.parent === id)
  const subtree = (x) => [x.text, ...kids(x.id).map(subtree)].join(' ')
  const lead = u.parent && byId.get(u.parent) ? byId.get(u.parent).text + ' … ' : ''
  return {
    label: u.label,
    act: a.name,
    url: `${a.url}#${u.anchor}`,
    text: lead + (whole ? subtree(u) : u.text),
  }
}

export const EXAM_PATH = '/zkouska/'

/**
 * @param {{ guide: { title: string, description: string, intro: string, faq: { q: string, a: string, cites: { act: string, unit: string, whole?: boolean }[] }[] }, acts: Record<string, any>, origin: string, cssHref: string }} p
 */
export function renderExamPage({ guide, acts, origin, cssHref }) {
  const url = `${origin}${EXAM_PATH}`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const items = guide.faq
    .map((f) => {
      const quotes = f.cites
        .map((c) => {
          const q = resolveQuote(acts, c)
          return `
          <figure class="mt-3 border-l-2 border-brass-500/70 bg-steel-900/60 py-3 pl-4 pr-3">
            <figcaption class="font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-brass-300">${esc(q.label)}</figcaption>
            <blockquote class="mt-2 leading-relaxed text-steel-200">${esc(q.text)}</blockquote>
            <p class="mt-2 text-[0.8125rem] text-steel-400">${esc(q.act)}. <a class="whitespace-nowrap text-verdigris-400 underline" href="${esc(q.url)}" rel="noopener">Celé znění ↗</a></p>
          </figure>`
        })
        .join('')
      return `
        <section class="mt-8">
          <h2 class="text-lg font-semibold text-steel-50">${esc(f.q)}</h2>
          <p class="mt-2 leading-relaxed text-steel-200">${esc(f.a)}</p>${quotes}
        </section>`
    })
    .join('')

  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(guide.title)} | Zbrojní kvíz</title>
    <meta name="description" content="${esc(guide.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(guide.title)}" />
    <meta property="og:description" content="${esc(guide.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${origin}/og.png" />
    <meta name="theme-color" content="#0d0f13" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${cssHref}" />
    <script type="application/ld+json">${JSON.stringify(ld).replaceAll('<', '\\u003c')}</script>
  </head>
  <body>
    <main class="mx-auto w-full max-w-2xl px-4 py-6 text-steel-200">
      <p class="font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-steel-400">
        <a class="text-brass-300 underline" href="${origin}/">Zbrojní kvíz</a> · zkouška 2026
      </p>
      <h1 class="mt-4 text-balance text-2xl font-semibold leading-snug text-steel-50">${esc(guide.title)}</h1>
      <p class="mt-3 leading-relaxed text-steel-300">${esc(guide.intro)}</p>${items}
      <p class="mt-10">
        <a class="inline-block rounded-card bg-brass-500 px-5 py-2.5 font-semibold uppercase tracking-wide text-steel-950" href="${origin}/">Vyzkoušet test nanečisto</a>
      </p>
      <p class="mt-8 text-[0.8125rem] text-steel-400">
        Zbrojní kvíz je bezplatná cvičná aplikace, ne oficiální služba Ministerstva vnitra ani Policie ČR.
        Závazné je znění předpisů ve Sbírce zákonů.
      </p>
    </main>
  </body>
</html>
`
}
