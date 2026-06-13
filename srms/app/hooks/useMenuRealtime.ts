import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { MENU_ITEM_KEYS } from '@/hooks/useMenu'

export function useMenuRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubChannel = runWhenConnected(() => subscribeChannel(WS_CHANNELS.MENU))
    const unsub = onWsEvent(WS_EVENTS.MENU_ITEM_AVAILABILITY_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
    })
    return () => {
      unsubChannel()
      unsub()
    }
  }, [queryClient])
}
