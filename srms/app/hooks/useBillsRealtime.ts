import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { BILL_KEYS } from '@/hooks/useBills'

export function useBillsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubChannel = runWhenConnected(() => subscribeChannel(WS_CHANNELS.TABLES))

    const invalidateBills = () => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all })
    }

    const unsubs = [
      onWsEvent(WS_EVENTS.BILL_CREATED, invalidateBills),
      onWsEvent(WS_EVENTS.BILL_UPDATED, invalidateBills),
      onWsEvent(WS_EVENTS.BILL_STATUS_UPDATED, invalidateBills),
      onWsEvent(WS_EVENTS.BILL_PAYMENT_CONFIRMED, invalidateBills),
    ]

    return () => {
      unsubChannel()
      unsubs.forEach((fn) => fn())
    }
  }, [queryClient])
}
