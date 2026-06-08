import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { authStore } from '@/stores/auth.store'
import { API } from '@/constants/api'
import { ROUTES } from '@/constants/routes'

const MAX_REFRESH_RETRIES = 3
const RETRY_META_KEY      = '__retryCount'

export const api: AxiosInstance = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request queue — serialise concurrent 401s ─────────────────
let isRefreshing = false

type Resolver = (token: string) => void
type Rejecter  = (error: unknown) => void
let queue: Array<{ resolve: Resolver; reject: Rejecter }> = []

function drainQueue(token: string): void {
  queue.forEach(({ resolve }) => resolve(token))
  queue = []
}

function rejectQueue(error: unknown): void {
  queue.forEach(({ reject }) => reject(error))
  queue = []
}

function enqueue(): Promise<string> {
  return new Promise((resolve, reject) => queue.push({ resolve, reject }))
}

function redirectToLogin(): void {
  authStore.getState().clearAuth()
  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN
  }
}

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — 401 handling ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      [RETRY_META_KEY]?: number
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // CASE 1: The failed request IS the refresh endpoint
    if (original.url?.includes(API.AUTH.REFRESH)) {
      const retries = (original[RETRY_META_KEY] ?? 0) + 1

      if (retries < MAX_REFRESH_RETRIES) {
        original[RETRY_META_KEY] = retries
        await new Promise((r) => setTimeout(r, retries * 300))
        return api(original)
      }

      rejectQueue(error)
      isRefreshing = false
      redirectToLogin()
      return Promise.reject(error)
    }

    // CASE 2: Another refresh is already in flight — queue this request
    if (isRefreshing) {
      return enqueue().then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      })
    }

    // CASE 3: First 401 — initiate token refresh
    isRefreshing = true

    try {
      const { data } = await api.post(API.AUTH.REFRESH)
      const newToken: string = data.data.access_token

      authStore.getState().setAccessToken(newToken)
      drainQueue(newToken)

      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)

    } catch (refreshError) {
      rejectQueue(refreshError)
      redirectToLogin()
      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)
