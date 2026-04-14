import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { InitialAvatar } from '../ui/InitialAvatar'
import { Menu, X } from 'lucide-react'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isChat = loc.pathname.startsWith('/chat')

  useEffect(() => {
    setMobileNavOpen(false)
  }, [loc.pathname])

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

          <nav className="dm-nav-links items-center gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `dm-ring rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `dm-ring rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`
              }
            >
              Upload
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="dm-nav-toggle dm-ring rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 hover:text-white"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

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

      {mobileNavOpen ? (
        <div className="dm-nav-panel border-b border-white/10 bg-bg/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
            <NavLink
              to="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `dm-ring rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/upload"
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `dm-ring rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'}`
              }
            >
              Upload
            </NavLink>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Outlet />
      </main>
    </div>
  )
}

