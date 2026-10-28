// First-party page_view beacon for the static question pages (/otazka/<id>/). Those pages carry
// no app bundle, so they can't use flywheel-client; this is the same insert, in ~1 KB of plain
// JS: one row into flywheel-core's events table, the same visitor id (localStorage 'fw:vid'),
// and the same rule for automated browsers (webdriver, headless, crawlers send nothing).
// prerender.mjs writes it to dist/fw-beacon.js with the build's Supabase URL and publishable key.

// Same pattern as flywheel-client BOT_UA — keep the two in step.
const BOT_UA = /bot\b|crawl|spider|slurp|headless|lighthouse|prerender|pagespeed|googleother|bingpreview|facebookexternalhit|embedly|preview/i

/**
 * Sends one page_view for the current path. Returns the row it sent, or null when it sent nothing.
 * Takes its globals as arguments so vitest can drive it; the shipped file calls it with `window`.
 * @param {{ navigator: { webdriver?: boolean, userAgent?: string }, location: { pathname: string },
 *   localStorage?: Storage, sessionStorage?: Storage, fetch: typeof fetch, crypto?: { randomUUID?: () => string } }} w
 * @param {{ url: string, key: string, app: string, botUa: RegExp }} cfg
 */
export function sendPageView(w, cfg) {
  const nav = w.navigator || {}
  if (nav.webdriver === true || cfg.botUa.test(nav.userAgent || '')) return null
  // Storage is read inside the try: with site data blocked, touching window.localStorage throws.
  const id = (store, k) => {
    try {
      const s = store()
      let v = s.getItem(k)
      if (!v) {
        v = w.crypto.randomUUID()
        s.setItem(k, v)
      }
      return v
    } catch {
      return 'anon'
    }
  }
  const row = {
    app: cfg.app,
    event: 'page_view',
    props: { path: w.location.pathname, static: true },
    visitor_id: id(() => w.localStorage, 'fw:vid'),
    session_id: id(() => w.sessionStorage || w.localStorage, 'fw:sid'),
    flywheel_uid: null,
    created_at: new Date().toISOString(),
  }
  try {
    w.fetch(`${cfg.url}/rest/v1/events`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: cfg.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    }).catch(() => {})
  } catch {
    // analytics never breaks the page
  }
  return row
}

/** The shipped file's source: the function above, called once with this build's config. */
export function beaconScript({ url, key, app = 'zbrojni-kviz' }) {
  const cfg = `{url:${JSON.stringify(url.replace(/\/$/, ''))},key:${JSON.stringify(key)},app:${JSON.stringify(app)},botUa:${BOT_UA}}`
  return `// flywheel page_view beacon (src/seo/beacon.mjs)\n(${sendPageView.toString()})(window,${cfg});\n`
}

/** Path the question pages load the beacon from. */
export const BEACON_PATH = '/fw-beacon.js'
