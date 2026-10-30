// One static page per official question (/otazka/<id>/), readable without JavaScript — for
// people who search an exam question word for word, and for crawlers and AI assistants that
// don't run the app. Plain JS so both vitest and scripts/prerender.mjs can import it.
// No app bundle on these pages: the SPA would boot over the content and replace it.

const LETTERS = { a: 'A', b: 'B', c: 'C' }

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…')

/** @param {number} id */
export const questionPath = (id) => `/otazka/${id}/`

/**
 * @param {{
 *   q: { id: number, cat: string, q: string, a: string, b: string, c: string, correct: 'a'|'b'|'c', images: string[] },
 *   source: { label: string, act: string, url: string, quote: string } | null,
 *   topic: { slug: string, category: string },
 *   prev: number | null, next: number | null,
 *   origin: string, cssHref: string,
 *   canonicalId?: number | null,
 *   beaconSrc?: string | null,
 * }} p
 */
export function renderQuestionPage({ q, source, topic, prev, next, origin, cssHref, canonicalId = null, beaconSrc = null }) {
  const url = `${origin}${questionPath(q.id)}`
  const right = q[q.correct]
  // Many stems repeat ("Vyberte správné tvrzení:"), so the number makes each title unique.
  const title = `Otázka č. ${q.id}: ${clip(q.q, 60)} | Zbrojní kvíz`
  // The MV file lists two questions twice verbatim; the second copy points at the first.
  const canonical = `${origin}${questionPath(canonicalId ?? q.id)}`
  const description = `Otázka č. ${q.id} ke zkoušce na zbrojní oprávnění (${q.cat}). Správná odpověď ${LETTERS[q.correct]}: ${clip(right, 120)}`
  const wrong = ['a', 'b', 'c'].filter((o) => o !== q.correct)
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `Zkouška odborné způsobilosti — otázka č. ${q.id}`,
    about: q.cat,
    inLanguage: 'cs',
    educationalLevel: 'zkouška odborné způsobilosti pro zbrojní oprávnění',
    isBasedOn: 'https://mv.gov.cz/zbrojni-opravneni',
    hasPart: [
      {
        '@type': 'Question',
        eduQuestionType: 'Multiple choice',
        text: q.q,
        acceptedAnswer: { '@type': 'Answer', text: right },
        suggestedAnswer: wrong.map((o) => ({ '@type': 'Answer', text: q[o] })),
        ...(source ? { citation: `${source.label}, ${source.act}` } : {}),
      },
    ],
  }
  const options = ['a', 'b', 'c']
    .map((o) => {
      const ok = o === q.correct
      return `
          <li class="flex gap-3 rounded-card border px-4 py-3 ${ok ? 'border-verdigris-500 bg-verdigris-500/12 text-steel-50' : 'border-steel-700 text-steel-300'}">
            <span class="font-mono font-semibold">${LETTERS[o]}</span>
            <span>${esc(q[o])}${ok ? ' <strong class="whitespace-nowrap text-verdigris-400">✓ správně</strong>' : ''}</span>
          </li>`
    })
    .join('')
  const images = q.images.length
    ? `
        <div class="mt-4 flex flex-wrap justify-center gap-3 rounded-lg bg-steel-50 p-4">${q.images
          .map((img) => `<img src="/img/${esc(img)}" alt="Obrázek k otázce č. ${q.id}" class="max-h-56 w-auto" loading="lazy" />`)
          .join('')}</div>`
    : ''
  const law = source
    ? `
        <section aria-label="Zdroj: ${esc(source.label)}" class="mt-6 border-l-2 border-brass-500/70 bg-steel-900/60 py-3 pl-4 pr-3">
          <p class="font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-brass-300">${source.act.startsWith('Nařízení vlády') ? 'Z nařízení vlády' : 'Ze zákona'} · ${esc(source.label)}</p>
          <blockquote class="mt-2 leading-relaxed text-steel-200">${esc(source.quote)}</blockquote>
          <p class="mt-2 text-[0.8125rem] text-steel-400">${esc(source.act)}. <a class="whitespace-nowrap text-verdigris-400 underline" href="${esc(source.url)}" rel="noopener">Celé znění ↗</a></p>
        </section>`
    : ''
  const nav = [
    prev ? `<a class="text-verdigris-400 underline" href="${origin}${questionPath(prev)}">← Otázka č. ${prev}</a>` : '<span></span>',
    next ? `<a class="text-verdigris-400 underline" href="${origin}${questionPath(next)}">Otázka č. ${next} →</a>` : '<span></span>',
  ].join('\n          ')

  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${origin}/og.png" />
    <meta name="theme-color" content="#0d0f13" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${cssHref}" />
    <script type="application/ld+json">${JSON.stringify(ld).replaceAll('<', '\\u003c')}</script>
${beaconSrc ? `    <script src="${beaconSrc}" defer></script>\n` : ''}  </head>
  <body>
    <main class="mx-auto w-full max-w-2xl px-4 py-6 text-steel-200">
      <p class="font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-steel-400">
        <a class="text-brass-300 underline" href="${origin}/">Zbrojní kvíz</a> ·
        <a class="underline" href="${origin}/okruh/${topic.slug}/">${esc(topic.category)}</a> · otázka č. ${q.id}
      </p>
      <h1 class="mt-4 text-balance text-xl font-semibold leading-relaxed text-steel-50">${esc(q.q)}</h1>${images}
      <ol class="mt-5 flex flex-col gap-3" aria-label="Možnosti odpovědi">${options}
      </ol>
      <p class="mt-4 font-semibold text-steel-50">Správná odpověď: ${LETTERS[q.correct]} — ${esc(right)}</p>${law}
      <p class="mt-6">
        <a class="inline-block rounded-card bg-brass-500 px-5 py-2.5 font-semibold uppercase tracking-wide text-steel-950" href="${origin}/okruh/${topic.slug}/">Procvičit okruh ${esc(topic.category)}</a>
      </p>
      <nav class="mt-6 flex justify-between" aria-label="Sousední otázky">
          ${nav}
      </nav>
      <p class="mt-8 text-[0.8125rem] text-steel-400">
        Otázka a správná odpověď jsou z oficiálního souboru testových otázek Ministerstva vnitra ČR,
        platného od 1. 1. 2026 (zákon č. 90/2024 Sb.). Zbrojní kvíz je bezplatná cvičná aplikace,
        ne oficiální služba ministerstva. Test u zkoušky má 30 otázek, 40 minut a uspějete s 26
        správnými (28 u rozšířeného zbrojního oprávnění).
      </p>
    </main>
  </body>
</html>
`
}
