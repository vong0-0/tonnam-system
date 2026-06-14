import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { MENU_ITEM_KEYS, MENU_CATEGORY_KEYS } from '@/hooks/useMenu'

export function useMenuRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubChannel = runWhenConnected(() => subscribeChannel(WS_CHANNELS.MENU))

    const invalidateItems      = () => queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
    const invalidateCategories = () => queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
    const invalidateBoth       = () => { invalidateItems(); invalidateCategories() }

    const unsubs = [
      onWsEvent(WS_EVENTS.MENU_ITEM_CREATED,              invalidateBoth),
      onWsEvent(WS_EVENTS.MENU_ITEM_UPDATED,              invalidateBoth),
      onWsEvent(WS_EVENTS.MENU_ITEM_DELETED,              invalidateBoth),
      onWsEvent(WS_EVENTS.MENU_ITEM_AVAILABILITY_UPDATED, invalidateItems),
      onWsEvent(WS_EVENTS.MENU_CATEGORY_CREATED,          invalidateCategories),
      onWsEvent(WS_EVENTS.MENU_CATEGORY_UPDATED,          invalidateCategories),
      onWsEvent(WS_EVENTS.MENU_CATEGORY_DELETED,          invalidateBoth),
    ]

    return () => {
      unsubChannel()
      unsubs.forEach((unsub) => unsub())
    }
  }, [queryClient])
}
