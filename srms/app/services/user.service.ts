import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { PaginatedResponse, ApiResponse } from '@/types/api'
import type { User } from '@/types/entities'
import type { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema'

export async function listAllUsers(): Promise<PaginatedResponse<User>> {
  const { data } = await api.get<PaginatedResponse<User>>(API.USERS, {
    params: sanitizeParams({ limit: 200 }),
  })
  return data
}

export async function createUser(body: CreateUserInput): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>(API.USERS, body)
  return data.data
}

export async function updateUser(id: string, body: UpdateUserInput): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>(API.USER(id), body)
  return data.data
}

export async function deactivateUser(id: string): Promise<User> {
  const { data } = await api.delete<ApiResponse<User>>(API.USER(id))
  return data.data
}

export async function reactivateUser(id: string): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>(API.USER(id), { is_active: true })
  return data.data
}
