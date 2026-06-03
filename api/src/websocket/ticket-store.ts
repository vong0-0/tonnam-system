import { randomBytes } from 'node:crypto'
import { problem } from '@/utils/problem.js'

interface TicketEntry {
  userId: string
  username: string
  role: string
  expiresAt: number
  used: boolean
}

const store = new Map<string, TicketEntry>()

export function createTicket(userId: string, username: string, role: string): string {
  const ticket = 'wst_' + randomBytes(16).toString('hex')
  store.set(ticket, { userId, username, role, expiresAt: Date.now() + 30_000, used: false })
  return ticket
}

export function consumeTicket(ticket: string): TicketEntry {
  const entry = store.get(ticket)

  if (!entry || entry.expiresAt < Date.now()) {
    throw problem({
      type: 'INVALID_TICKET',
      title: 'Unauthorized',
      status: 401,
      detail: 'Ticket is invalid or has expired.',
      instance: '/v1/auth/ws-ticket',
    })
  }

  if (entry.used) {
    throw problem({
      type: 'TICKET_ALREADY_USED',
      title: 'Unauthorized',
      status: 401,
      detail: 'Ticket has already been used.',
      instance: '/v1/auth/ws-ticket',
    })
  }

  entry.used = true
  return entry
}

export function purgeExpiredTickets(): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key)
  }
}

setInterval(purgeExpiredTickets, 60_000)
