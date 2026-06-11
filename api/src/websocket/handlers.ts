import http from 'http'
import { Server } from 'socket.io'
import { wsAllowedOrigins } from '@/config/cors.js'
import { consumeTicket } from '@/websocket/ticket-store.js'
import { WS_EVENTS } from '@/websocket/events.js'
import logger from '@/utils/logger.js'
import type { ProblemDetail } from '@/utils/problem.js'

export let io: Server

function canSubscribe(role: string, channel: string): boolean {
  const isExact = (name: string): boolean => channel === name
  const isPrefix = (prefix: string, exclude?: string): boolean =>
    channel.startsWith(prefix) && channel !== exclude

  switch (role) {
    case 'ADMIN':
      return (
        isExact('tables') ||
        isExact('orders') ||
        isPrefix('bill:') ||
        isExact('menu') ||
        isExact('kitchen')
      )
    case 'CASHIER':
      return (
        isExact('tables') ||
        isPrefix('table:', 'tables') ||
        isExact('orders') ||
        isPrefix('order:', 'orders') ||
        isPrefix('bill:') ||
        isExact('menu')
      )
    case 'WAITER':
      return (
        isExact('tables') ||
        isPrefix('table:', 'tables') ||
        isExact('orders') ||
        isPrefix('order:', 'orders') ||
        isExact('menu')
      )
    case 'KITCHEN':
      return (
        isExact('orders') ||
        isPrefix('order:', 'orders') ||
        isExact('kitchen')
      )
    default:
      return false
  }
}

export function initWebSocket(server: http.Server): Server {
  io = new Server(server, { cors: { origin: wsAllowedOrigins, credentials: true } })

  io.on('connection', (socket) => {
    const ticket = socket.handshake.query['ticket']

    if (!ticket || typeof ticket !== 'string') {
      socket.emit(
        'message',
        JSON.stringify({
          event: 'error',
          code: 'UNAUTHORIZED',
          message: 'Missing ticket query parameter.',
        }),
      )
      socket.disconnect(true)
      return
    }

    let userId: string
    let username: string
    let role: string

    try {
      const entry = consumeTicket(ticket)
      userId = entry.userId
      username = entry.username
      role = entry.role
    } catch (err) {
      const detail = (err as ProblemDetail).detail ?? 'Authentication failed.'
      socket.emit(
        'message',
        JSON.stringify({
          event: WS_EVENTS.SYSTEM_TOKEN_EXPIRED,
          data: { message: detail },
          timestamp: new Date().toISOString(),
        }),
      )
      socket.disconnect(true)
      return
    }

    socket.data = { userId, username, role }
    logger.info('WebSocket connected', { userId, username, role, socketId: socket.id })

    socket.on('message', (raw: unknown) => {
      let event: string
      let channel: string

      try {
        const parsed = JSON.parse(String(raw)) as { event?: unknown; channel?: unknown }
        event = typeof parsed.event === 'string' ? parsed.event : ''
        channel = typeof parsed.channel === 'string' ? parsed.channel : ''
      } catch {
        return
      }

      if (event === 'subscribe') {
        if (!canSubscribe(role, channel)) {
          socket.emit(
            'message',
            JSON.stringify({
              event: 'error',
              code: 'FORBIDDEN_CHANNEL',
              channel,
              message: 'Your role does not have access to this channel.',
            }),
          )
          return
        }
        socket.join(channel)
        socket.emit('message', JSON.stringify({ event: 'subscribed', channel }))
        return
      }

      if (event === 'unsubscribe') {
        if (!socket.rooms.has(channel)) {
          socket.emit(
            'message',
            JSON.stringify({
              event: 'error',
              code: 'NOT_SUBSCRIBED',
              channel,
              message: 'You are not subscribed to this channel.',
            }),
          )
          return
        }
        socket.leave(channel)
        socket.emit('message', JSON.stringify({ event: 'unsubscribed', channel }))
      }
    })

    socket.on('disconnect', () => {
      logger.info('WebSocket disconnected', { socketId: socket.id })
    })
  })

  return io
}
