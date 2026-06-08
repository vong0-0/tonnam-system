import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { login, logout, getMe } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/constants/routes'
import { ROLE_REDIRECT } from '@/constants/roles'

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.access_token)
      navigate(ROLE_REDIRECT[data.user.role], { replace: true })
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
    },
  })
}

export function useRestoreAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await getMe()
      const token = useAuthStore.getState().accessToken
      if (!token) throw new Error('Token not set after refresh')
      useAuthStore.getState().setAuth(res.data, token)
      return res.data
    },
    retry: false,
    staleTime: Infinity,
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await getMe()
      return res.data
    },
    staleTime: 5 * 60_000,
  })
}
