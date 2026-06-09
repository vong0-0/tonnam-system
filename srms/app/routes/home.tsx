import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_REDIRECT } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'

export default function Home() {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to={"select"} replace />
  }

  return <Navigate to={ROUTES.LOGIN} replace />
}
