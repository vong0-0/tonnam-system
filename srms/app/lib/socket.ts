import { io, type Socket } from 'socket.io-client'
import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { ROUTES } from '@/constants/routes'
import type { WsChannel } from '@/constants/socket'
import type { WsPayloadMap, WsMessage } from '@/types'

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_BASE   = 1_000

// ── Private module state ──────────────────────────────────────
let socket:              Socket | null                     = null
let reconnectAttempts:   number                            = 0
let reconnectTimer:      number | null                     = null
let connectionGeneration: number                           = 0
const pendingConnectFns: Array<() => void>                 = []

// ── Helpers ───────────────────────────────────────────────────
function redirectToLogin(): void {
  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN
  }
}

function scheduleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[socket] Max reconnect attempts reached — giving up')
    disconnectSocket()
    return
  }

  reconnectAttempts++

  const delay =
    RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts - 1) +
    Math.random() * 500

  console.info(
    `[socket] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
  )

  reconnectTimer = window.setTimeout(async () => {
    try {
      await connectSocket()
    } catch {
      scheduleReconnect()
    }
  }, delay)
}

function handleOnline(): void {
  if (!socket?.connected) {
    console.info('[socket] Network back online — attempting reconnect')
    window.removeEventListener('online', handleOnline)
    connectSocket()
  }
}

// ── Exported functions ────────────────────────────────────────

export async function connectSocket(): Promise<void> {
  if (socket?.connected) return

  const myGen = ++connectionGeneration

  const { data } = await api.post(API.AUTH.WS_TICKET)

  if (myGen !== connectionGeneration) return

  const ticket: string = data.data.ticket

  socket = io(import.meta.env.VITE_API_URL as string, {
    query:       { ticket },
    transports:  ['websocket'],
    autoConnect: false,
  })

  const currentSocket = socket

  currentSocket.on('connect', () => {
    if (myGen !== connectionGeneration) {
      currentSocket.disconnect()
      return
    }
    reconnectAttempts = 0
    reconnectTimer    = null
    console.info('[socket] Connected', currentSocket.id)
    const cbs = pendingConnectFns.splice(0)
    cbs.forEach((fn) => fn())
  })

  currentSocket.on('disconnect', (reason) => {
    console.warn('[socket] Disconnected:', reason)

    if (reason === 'io server disconnect') {
      disconnectSocket()
      redirectToLogin()
      return
    }

    scheduleReconnect()
  })

  currentSocket.on('connect_error', (error) => {
    console.error('[socket] Connection error:', error.message)
    scheduleReconnect()
  })

  currentSocket.on('message', (raw: string) => {
    try {
      const msg = JSON.parse(raw) as WsMessage
      if (
        msg.event === 'system:token_expired' ||
        msg.event === 'system:force_logout'
      ) {
        disconnectSocket()
        redirectToLogin()
      }
    } catch {
      // ignore parse errors on system handler
    }
  })

  currentSocket.connect()
  window.addEventListener('online', handleOnline)
}

export function disconnectSocket(): void {
  connectionGeneration++
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer as number)
    reconnectTimer = null
  }
  window.removeEventListener('online', handleOnline)
  socket?.disconnect()
  socket             = null
  reconnectAttempts  = 0
}

export function subscribeChannel(channel: WsChannel): void {
  if (!socket?.connected) {
    console.warn(
      `[socket] subscribeChannel('${channel}') called before connected.`,
      'Always call subscribeChannel() after connectSocket() resolves.'
    )
    return
  }
  socket.emit('message', JSON.stringify({ event: 'subscribe', channel }))
}

export function onWsEvent<K extends keyof WsPayloadMap>(
  event: K,
  handler: (data: WsPayloadMap[K]) => void
): () => void {
  const listener = (raw: string) => {
    try {
      const msg = JSON.parse(raw) as WsMessage
      if (msg.event === event) {
        handler(msg.data as WsPayloadMap[K])
      }
    } catch {
      console.warn('[socket] Failed to parse message', raw)
    }
  }
  socket?.on('message', listener)
  return () => socket?.off('message', listener)
}

export function getSocket(): Socket | null {
  return socket
}

export function runWhenConnected(fn: () => void): () => void {
  if (socket?.connected) {
    fn()
    return () => {}
  }
  if (socket) {
    socket.once('connect', fn)
    return () => socket?.off('connect', fn)
  }
  pendingConnectFns.push(fn)
  return () => {
    const i = pendingConnectFns.indexOf(fn)
    if (i >= 0) pendingConnectFns.splice(i, 1)
  }
}
