import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'

export function AuthPanel() {
  const { configured, user, signInWithGoogle, signInWithEmail, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When auth is not configured, progress still saves locally — say so quietly.
  if (!configured) {
    return (
      <span className="text-xs text-steel-600" title="Postup je uložen v tomto prohlížeči.">
        Postup uložen lokálně
      </span>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-steel-400">{user.email ?? 'Přihlášen(a)'}</span>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-steel-400 hover:text-brass-400"
        >
          Odhlásit
        </button>
      </div>
    )
  }

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
        className="rounded-card border border-steel-700 px-3 py-1.5 text-sm text-steel-200 hover:border-brass-500"
      >
        Přihlásit
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-card border border-steel-700 bg-steel-900 p-4 shadow-xl">
          <p className="mb-3 text-sm text-steel-300">
            Synchronizace postupu mezi zařízeními.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="mb-3 w-full rounded-card bg-steel-100 px-4 py-2 text-sm font-semibold text-steel-900 hover:bg-white"
          >
            Pokračovat přes Google
          </button>
          <div className="my-3 flex items-center gap-2 text-xs text-steel-600">
            <span className="h-px flex-1 bg-steel-700" /> nebo{' '}
            <span className="h-px flex-1 bg-steel-700" />
          </div>
          {sent ? (
            <p className="text-sm text-verdigris-400">
              Odkaz jsme poslali na e-mail.
            </p>
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
        </div>
      )}
    </div>
  )
}
