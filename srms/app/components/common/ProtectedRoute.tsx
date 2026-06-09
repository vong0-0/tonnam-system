import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/constants/roles'

interface Props {
  roles?: Role[]
  children: ReactNode
}

export function ProtectedRoute({ roles, children }: Props) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (roles && !roles.includes(user!.role)) {
    return <Navigate to={ROUTES.SELECT} replace />
  }

  return <>{children}</>
}
