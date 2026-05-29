import { randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt, { type JwtPayload as LibJwtPayload } from 'jsonwebtoken'
import { UserModel } from '@/models/user.model.js'
import { type JwtPayload, type WsTicketPayload, type Role } from '@/types/index.js'
import { createHttpError } from '@/utils/errors.js'
import logger from '@/utils/logger.js'

interface TicketEntry {
  userId: string
  role: Role
  name: string
  expiresAt: number
}

type TokenPair = { accessToken: string; refreshToken: string }

export const ticketStore = new Map<string, TicketEntry>()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (value === undefined || value === '') throw new Error(`Missing environment variable: ${key}`)
  return value
}

type Expiry = Exclude<jwt.SignOptions['expiresIn'], undefined>

function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, requireEnv('JWT_SECRET'), {
    expiresIn: requireEnv('JWT_EXPIRES_IN') as Expiry,
  })
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, requireEnv('JWT_REFRESH_SECRET'), {
    expiresIn: requireEnv('JWT_REFRESH_EXPIRES_IN') as Expiry,
  })
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const INVALID = 'Invalid username or password'

  const user = await UserModel.findOne({ username, is_active: true })
  if (!user) throw createHttpError(401, INVALID)

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw createHttpError(401, INVALID)

  const userId = String(user._id)
  const name = `${user.first_name} ${user.last_name}`
  const payload: JwtPayload = { userId, role: user.role, name }

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(userId),
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  let decoded: string | LibJwtPayload

  try {
    decoded = jwt.verify(refreshToken, requireEnv('JWT_REFRESH_SECRET'))
  } catch {
    throw createHttpError(401, 'Invalid or expired refresh token')
  }

  if (typeof decoded === 'string') throw createHttpError(401, 'Invalid or expired refresh token')

  const userId = decoded['userId']
  if (typeof userId !== 'string') throw createHttpError(401, 'Invalid or expired refresh token')

  const user = await UserModel.findOne({ _id: userId, is_active: true })
  if (!user) throw createHttpError(401, 'Invalid or expired refresh token')

  const name = `${user.first_name} ${user.last_name}`
  const payload: JwtPayload = { userId, role: user.role, name }

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(userId),
  }
}

export async function logout(userId: string): Promise<void> {
  logger.info('User logged out', { userId })
}

export async function generateWsTicket(
  userId: string,
  role: Role,
  name: string,
): Promise<WsTicketPayload> {
  const ticket = randomUUID()
  const raw = Number(process.env['WS_TICKET_EXPIRES_IN'])
  const expiresIn = isNaN(raw) || raw <= 0 ? 30 : raw

  ticketStore.set(ticket, { userId, role, name, expiresAt: Date.now() + expiresIn * 1000 })

  return { ticket, expiresIn }
}

export function validateWsTicket(
  ticket: string,
): { userId: string; role: Role; name: string } | null {
  const entry = ticketStore.get(ticket)
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    ticketStore.delete(ticket)
    return null
  }

  ticketStore.delete(ticket)
  return { userId: entry.userId, role: entry.role, name: entry.name }
}
