import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { InitialAvatar } from '../ui/InitialAvatar'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const isChat = loc.pathname.startsWith('/chat')

  if (isChat) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-5 flex items-center justify-between gap-3">
          <Logo />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <InitialAvatar value={user?.name ?? user?.email ?? 'Guest'} />
              <div className="leading-tight min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user?.name ?? 'Guest'}</div>
                <div className="text-xs text-white/55 truncate">{user?.email ?? '—'}</div>
              </div>
            </div>

            <div className="sm:hidden">
              <InitialAvatar value={user?.name ?? user?.email ?? 'Guest'} />
            </div>

            <Button variant="secondary" onClick={logout} className="h-10 px-4">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Outlet />
      </main>
    </div>
  )
}

