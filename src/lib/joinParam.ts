// Test C: an instructor's join link (/?trida=K7Q-M2D). The code is taken from the address once,
// kept for this browser session until the learner saves it, and the address bar is left clean.
const PENDING_KEY = 'zbrojni-kviz:pending-class'

export function takeJoinCode(): void {
  try {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('trida')
    if (!code) return
    sessionStorage.setItem(PENDING_KEY, code.slice(0, 20))
    url.searchParams.delete('trida')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  } catch {
    // no URL / storage: the learner can still type the code
  }
}

export function pendingJoinCode(): string | null {
  try {
    return sessionStorage.getItem(PENDING_KEY)
  } catch {
    return null
  }
}

export function clearPendingJoinCode(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}
