import { api } from '@/lib/api'
import { API } from '@/constants/api'
import type { ApiResponse, AuthUser, User } from '@/types'

interface LoginResponse {
  access_token: string
  user: AuthUser
}

interface RefreshResponse {
  access_token: string
}

export async function login(
  username: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const { data } = await api.post(API.AUTH.LOGIN, { username, password })
  return data
}

export async function logout(): Promise<void> {
  await api.post(API.AUTH.LOGOUT)
}

export async function refreshToken(): Promise<ApiResponse<RefreshResponse>> {
  const { data } = await api.post(API.AUTH.REFRESH)
  return data
}

export async function getMe(): Promise<ApiResponse<User>> {
  const { data } = await api.get(API.AUTH.ME)
  return data
}
