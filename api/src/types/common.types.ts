import type { Request } from 'express'
import type { Role } from './user.types.js'

export interface UserPayload {
  userId: string
  role: Role
  name: string
}

export interface AuthRequest extends Request {
  user: UserPayload
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: Pagination
}
