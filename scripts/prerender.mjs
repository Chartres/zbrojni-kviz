// Post-build prerender: one static, crawlable HTML page per okruh
// (/okruh/<slug>/), one per official question (/otazka/<id>/, src/seo/questionPage.mjs,
// no app bundle) + sitemap.xml. No SSR framework — the pages are copies of
// the built index.html with topic-specific <title>/meta/#root content; the app
// bundle boots on top and starts that topic's practice (see AppContext).
// Usage: node scripts/prerender.mjs   (after `vite build`)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderQuestionPage, questionPath } from '../src/seo/questionPage.mjs'
import { beaconScript, BEACON_PATH } from '../src/seo/beacon.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const ORIGIN = 'https://zbrojnikviz.dravec.org'
const topics = JSON.parse(readFileSync(`${root}data/topics.json`, 'utf8'))
const meta = JSON.parse(readFileSync(`${root}data/meta.json`, 'utf8'))
const questions = JSON.parse(readFileSync(`${root}data/questions.json`, 'utf8'))
const citations = JSON.parse(readFileSync(`${root}data/citations.json`, 'utf8'))
const template = readFileSync(`${root}dist/index.html`, 'utf8')
const cssHref = template.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"/)[1]

const sourceFor = (id) => {
  const c = citations.questions[String(id)]
  if (!c) return null
  const act = citations.acts[c.act]
  return { label: c.label, act: act.name, url: `${act.url}#${c.anchor}`, quote: c.quote }
}

const countFor = (category) =>
  meta.categories.find((c) => c.name === category).count

const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

for (const t of topics) {
  const fill = (s) => s.replaceAll('{count}', String(countFor(t.category)))
  const url = `${ORIGIN}/okruh/${t.slug}/`
  const title = fill(t.title)
  const description = fill(t.description)
  const others = topics.filter((o) => o.slug !== t.slug)
  const body = `
      <div class="mx-auto w-full max-w-xl px-4 py-6 text-steel-200">
        <h1 class="font-display text-2xl font-bold tracking-tight text-brass-300">${esc(fill(t.h1))}</h1>
        <p class="mt-3 text-steel-300">${esc(fill(t.intro))}</p>
        <p class="mt-3 text-steel-300"><a class="text-verdigris-400 hover:underline" href="${url}">Spustit test zdarma</a> — bez reklam a bez registrace, funguje offline i na mobilu.</p>
        <h2 class="mt-6 font-display text-lg font-semibold text-brass-300">Časté otázky</h2>
        <dl class="mt-2 text-steel-300">${t.faq
          .map(
            (f) => `
          <dt class="mt-3 font-semibold text-steel-100">${esc(fill(f.q))}</dt>
          <dd>${esc(fill(f.a))}</dd>`,
          )
          .join('')}
        </dl>
        <h2 class="mt-6 font-display text-lg font-semibold text-brass-300">Všechny otázky okruhu se správnými odpověďmi</h2>
        <ol class="mt-2 text-steel-300">${questions
          .filter((q) => q.cat === t.category)
          .map(
            (q) => `
          <li><a class="text-verdigris-400 hover:underline" href="${ORIGIN}${questionPath(q.id)}">${q.id}. ${esc(q.q)}</a></li>`,
          )
          .join('')}
        </ol>
        <h2 class="mt-6 font-display text-lg font-semibold text-brass-300">Další okruhy</h2>
        <ul class="mt-2 text-steel-300">
          <li><a class="text-verdigris-400 hover:underline" href="${ORIGIN}/">Všechny testy ke zbrojnímu průkazu zdarma</a></li>${others
            .map(
              (o) => `
          <li><a class="text-verdigris-400 hover:underline" href="${ORIGIN}/okruh/${o.slug}/">${esc(o.category)}</a></li>`,
            )
            .join('')}
        </ul>
      </div>
`
  // JSON-LD that matches this page: its visible FAQ, not the home page's WebApplication.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.map((f) => ({
      '@type': 'Question',
      name: fill(f.q),
      acceptedAnswer: { '@type': 'Answer', text: fill(f.a) },
    })),
  }
  const html = template
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      '',
    )
    .replace('</head>', `  <script type="application/ld+json">${JSON.stringify(faqLd).replaceAll('<', '\\u003c')}</script>\n  </head>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${esc(description)}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${esc(title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${esc(description)}$2`,
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${esc(title)}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${esc(description)}$2`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${url}" />`,
    )
    .replace(/<!--seo-->[\s\S]*<!--\/seo-->/, `<!--seo-->${body}<!--/seo-->`)
  mkdirSync(`${root}dist/okruh/${t.slug}`, { recursive: true })
  writeFileSync(`${root}dist/okruh/${t.slug}/index.html`, html)
}

// The question pages carry no app bundle; a tiny beacon sends their page_view. Same build env as
// the app's analytics; without it (local builds, tests) the pages ship with no beacon.
const sbUrl = process.env.VITE_SUPABASE_URL
const sbKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
const beaconSrc = sbUrl && sbKey ? BEACON_PATH : null
if (beaconSrc) writeFileSync(`${root}dist${BEACON_PATH}`, beaconScript({ url: sbUrl, key: sbKey }))

const topicOf = Object.fromEntries(topics.map((t) => [t.category, t]))
const firstCopyOf = new Map(meta.duplicatePairs.map(([first, twin]) => [twin, first]))
questions.forEach((q, i) => {
  const html = renderQuestionPage({
    q,
    source: sourceFor(q.id),
    topic: topicOf[q.cat],
    prev: questions[i - 1]?.id ?? null,
    next: questions[i + 1]?.id ?? null,
    origin: ORIGIN,
    cssHref,
    canonicalId: firstCopyOf.get(q.id) ?? null,
    beaconSrc,
  })
  mkdirSync(`${root}dist${questionPath(q.id)}`, { recursive: true })
  writeFileSync(`${root}dist${questionPath(q.id)}index.html`, html)
})

const today = new Date().toISOString().slice(0, 10)
const urls = [
  '/',
  ...topics.map((t) => `/okruh/${t.slug}/`),
  ...questions.filter((q) => !firstCopyOf.has(q.id)).map((q) => questionPath(q.id)),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(`${root}dist/sitemap.xml`, sitemap)
console.log(`prerendered ${topics.length} topic pages, ${questions.length} question pages + sitemap.xml${beaconSrc ? ' (with page_view beacon)' : ' (no Supabase env: no beacon)'}`)
