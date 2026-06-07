import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'

/** Compact account control: a small avatar that opens a sign-in / account popover. */
export function AuthPanel() {
  const { configured, user, signInWithEmail, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth not configured → nothing to show (progress still saves locally).
  if (!configured) return null

  const initial = user?.email?.[0]?.toUpperCase()

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await signInWithEmail(email)
    if (res.ok) setSent(true)
    else setError(res.error ?? 'Něco se nepovedlo.')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={user ? 'Účet' : 'Přihlásit'}
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-steel-600 text-steel-300 transition-colors hover:border-brass-500 hover:text-brass-400"
      >
        {user && initial ? (
          <span className="font-mono text-sm font-semibold text-brass-300">
            {initial}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-card border border-steel-700 bg-steel-900 p-4 shadow-xl">
          {user ? (
            <>
              <p className="mb-1 text-xs uppercase tracking-wide text-steel-500">Přihlášen(a)</p>
              <p className="mb-3 truncate text-sm text-steel-200">{user.email}</p>
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full rounded-card border border-steel-600 px-4 py-2 text-sm font-semibold text-steel-200 hover:border-steel-400"
              >
                Odhlásit
              </button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-steel-300">
                Synchronizujte pokrok mezi zařízeními. Pošleme vám přihlašovací
                odkaz na e-mail.
              </p>
              {sent ? (
                <p className="text-sm text-verdigris-400">Odkaz jsme poslali na e-mail.</p>
              ) : (
                <form onSubmit={submitEmail}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.cz"
                    className="mb-2 w-full rounded-card border border-steel-700 bg-steel-800 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-brass-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-card bg-brass-500 px-4 py-2 text-sm font-semibold text-steel-950 hover:bg-brass-400"
                  >
                    Poslat přihlašovací odkaz
                  </button>
                  {error && <p className="mt-2 text-xs text-rust-400">{error}</p>}
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
