import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getErrorMessage, refreshSession, setOnAuthFailure } from '../lib/api'
import { loadUser, saveUser, type StoredUser } from '../lib/storage'

type AuthStatus = 'loading' | 'authed' | 'guest'

type AuthContextValue = {
  status: AuthStatus
  user: StoredUser | null
  login: (args: { email: string; password: string }) => Promise<void>
  register: (args: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<StoredUser | null>(() => loadUser())

  useEffect(() => {
    setOnAuthFailure(() => {
      setStatus('guest')
      setUser(null)
      saveUser(null)
      navigate('/auth', { replace: true })
    })
    return () => setOnAuthFailure(null)
  }, [navigate])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await refreshSession()
        if (!alive) return
        setStatus('authed')
      } catch {
        if (!alive) return
        setStatus('guest')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  async function login(args: { email: string; password: string }) {
    await api.post('/auth/login', args)
    const nextUser: StoredUser = { email: args.email }
    setUser(nextUser)
    saveUser(nextUser)
    setStatus('authed')
  }

  async function register(args: { name: string; email: string; password: string }) {
    await api.post('/auth/register', args)
    const nextUser: StoredUser = { email: args.email, name: args.name }
    setUser(nextUser)
    saveUser(nextUser)
    setStatus('authed')
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // backend may not implement; still clear local state
    }
    setUser(null)
    saveUser(null)
    setStatus('guest')
    navigate('/auth', { replace: true })
  }

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout }),
    [status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useFriendlyAuthError(err: unknown) {
  const msg = getErrorMessage(err)
  if (/network/i.test(msg)) return 'Cannot reach server. Is the backend running on localhost:5000?'
  return msg
}

