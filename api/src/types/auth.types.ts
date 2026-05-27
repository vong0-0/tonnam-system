import type { Role } from './user.types.js'

export interface JwtPayload {
  userId: string
  role: Role
  name: string
}

export interface JwtTokens {
  accessToken: string
}

export interface WsTicketPayload {
  ticket: string
  expiresIn: number
}
