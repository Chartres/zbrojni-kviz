export interface BeaconRow {
  app: string
  event: 'page_view'
  props: { path: string; static: true }
  visitor_id: string
  session_id: string
  flywheel_uid: null
  created_at: string
}

export function sendPageView(
  w: {
    navigator: { webdriver?: boolean; userAgent?: string }
    location: { pathname: string }
    localStorage?: Storage
    sessionStorage?: Storage
    fetch: typeof fetch
    crypto?: { randomUUID?: () => string }
  },
  cfg: { url: string; key: string; app: string; botUa: RegExp },
): BeaconRow | null

export function beaconScript(p: { url: string; key: string; app?: string }): string

export const BEACON_PATH: string
