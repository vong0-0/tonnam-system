import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { RESERVATION_KEYS } from '@/hooks/useReservations'
import { TABLE_KEYS } from '@/hooks/useTables'

export function useReservationsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubChannel = runWhenConnected(() => subscribeChannel(WS_CHANNELS.RESERVATIONS))

    const invalidateReservations = () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    }

    const unsubs = [
      onWsEvent(WS_EVENTS.RESERVATION_CREATED, invalidateReservations),
      onWsEvent(WS_EVENTS.RESERVATION_UPDATED, invalidateReservations),
      onWsEvent(WS_EVENTS.RESERVATION_DELETED, invalidateReservations),
      onWsEvent(WS_EVENTS.RESERVATION_STATUS_UPDATED, () => {
        queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      }),
    ]

    return () => {
      unsubChannel()
      unsubs.forEach((fn) => fn())
    }
  }, [queryClient])
}
