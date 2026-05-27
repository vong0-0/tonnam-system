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
