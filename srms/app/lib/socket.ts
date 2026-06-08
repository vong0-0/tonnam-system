import { io, type Socket } from 'socket.io-client'
import { api } from '@/lib/api'
import { API } from '@/constants/api'
import type { WsChannel } from '@/constants/socket'
import type { WsMessage, WsPayloadMap } from '@/types'

let socket: Socket | null = null

export async function connectSocket(): Promise<void> {
  const { data } = await api.post(API.AUTH.WS_TICKET)
  const ticket: string = data.data.ticket

  socket = io(import.meta.env.VITE_API_URL as string, {
    query:      { ticket },
    transports: ['websocket'],
  })
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function subscribeChannel(channel: WsChannel): void {
  socket?.emit('message', JSON.stringify({ event: 'subscribe', channel }))
}

export function onWsEvent<K extends keyof WsPayloadMap>(
  event: K,
  handler: (data: WsPayloadMap[K]) => void
): () => void {
  const listener = (raw: string) => {
    const msg = JSON.parse(raw) as WsMessage
    if (msg.event === event) handler(msg.data as WsPayloadMap[K])
  }
  socket?.on('message', listener)
  return () => socket?.off('message', listener)
}
