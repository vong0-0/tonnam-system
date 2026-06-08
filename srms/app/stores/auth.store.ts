import { create } from 'zustand'
import type { AuthUser } from '@/types'

interface AuthState {
  user:            AuthUser | null
  accessToken:     string | null
  isAuthenticated: () => boolean
  setAuth:         (user: AuthUser, token: string) => void
  setAccessToken:  (token: string) => void
  clearAuth:       () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user:        null,
  accessToken: null,

  isAuthenticated: () => get().user !== null && get().accessToken !== null,

  setAuth: (user, accessToken) => set({ user, accessToken }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearAuth: () => set({ user: null, accessToken: null }),
}))

// Vanilla getter — for use in interceptors outside React
export const authStore = useAuthStore
