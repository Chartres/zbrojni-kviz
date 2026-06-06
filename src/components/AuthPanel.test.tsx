import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthPanel } from './AuthPanel'
import { AuthProvider } from '@/auth/AuthContext'

// With no VITE_SUPABASE_* env vars (the default), auth is disabled and the app
// stays fully usable with local-only progress.
describe('AuthPanel (auth not configured)', () => {
  it('communicates that progress is saved locally and offers no sign-in', () => {
    render(
      <AuthProvider>
        <AuthPanel />
      </AuthProvider>,
    )
    expect(screen.getByText(/uložen lokálně/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /přihlásit/i })).not.toBeInTheDocument()
  })
})
