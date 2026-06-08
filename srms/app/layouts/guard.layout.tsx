import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTE_GUARDS } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'

export default function GuardLayout() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  const entry = Object.entries(ROUTE_GUARDS).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )

  if (entry) {
    const [, roles] = entry
    if (roles.length > 0 && !roles.includes(user.role)) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />
    }
  }

  return <Outlet />
}
