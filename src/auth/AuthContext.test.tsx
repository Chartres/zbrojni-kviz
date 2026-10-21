import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('./supabase', () => ({
  isAuthConfigured: true,
  supabase: {
    auth: {
      getSession: () => Promise.reject(new Error('auth lock')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  },
}))

function Probe() {
  const { loading } = useAuth()
  return <span>{loading ? 'loading' : 'ready'}</span>
}

describe('AuthProvider', () => {
  it('stops loading when getSession rejects (app_open waits on it)', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument())
  })
})
