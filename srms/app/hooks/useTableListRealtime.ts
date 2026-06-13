import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { TABLE_KEYS } from '@/hooks/useTables'

export function useTableListRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubChannel = runWhenConnected(() => subscribeChannel(WS_CHANNELS.TABLES))

    const unsubs = [
      onWsEvent(WS_EVENTS.TABLE_STATUS_UPDATED, () => {
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      }),
      onWsEvent(WS_EVENTS.TABLE_MOVED, () => {
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      }),
    ]

    return () => {
      unsubChannel()
      unsubs.forEach((fn) => fn())
    }
  }, [queryClient])
}
