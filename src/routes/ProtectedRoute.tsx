import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { Skeleton } from '../ui/Skeleton'

export function ProtectedRoute() {
  const { status } = useAuth()
  const loc = useLocation()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="dm-card rounded-2xl px-6 py-5 flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="text-sm text-white/75">Checking your session…</div>
        </div>
      </div>
    )
  }

  if (status !== 'authed') {
    return <Navigate to="/auth" replace state={{ from: loc.pathname }} />
  }

  return <Outlet />
}

