import axios, { type InternalAxiosRequestConfig } from 'axios'
import { authStore } from '@/stores/auth.store'
import { API } from '@/constants/api'
import { ROUTES } from '@/constants/routes'

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const api = axios.create({
  baseURL:      import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — 401 + token refresh ───────────────
let isRefreshing = false
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const drainQueue = (token: string) => {
  queue.forEach(({ resolve }) => resolve(token))
  queue = []
}

const rejectQueue = (error: unknown) => {
  queue.forEach(({ reject }) => reject(error))
  queue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryableConfig

    if (error.response?.status !== 401) return Promise.reject(error)

    // Prevent infinite loop — refresh endpoint itself returned 401
    if (original.url?.includes(API.AUTH.REFRESH)) {
      authStore.getState().clearAuth()
      window.location.href = ROUTES.LOGIN
      return Promise.reject(error)
    }

    // Another request is already refreshing — queue this one
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    isRefreshing = true
    original._retry = true

    try {
      const { data } = await api.post(API.AUTH.REFRESH)
      const newToken: string = data.data.access_token
      authStore.getState().setAccessToken(newToken)
      drainQueue(newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      rejectQueue(refreshError)
      authStore.getState().clearAuth()
      window.location.href = ROUTES.LOGIN
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
