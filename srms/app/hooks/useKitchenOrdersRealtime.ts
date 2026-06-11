import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, getSocket, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { ORDER_KEYS } from '@/hooks/useOrders'

export function useKitchenOrdersRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let listenerCleanups: Array<() => void> = []

    const setup = () => {
      const socket = getSocket()
      const handleReconnect = () => subscribeChannel(WS_CHANNELS.KITCHEN)
      socket?.on('connect', handleReconnect)
      subscribeChannel(WS_CHANNELS.KITCHEN)

      listenerCleanups = [
        () => socket?.off('connect', handleReconnect),
        onWsEvent(WS_EVENTS.ORDER_NEW_ORDER_RECEIVED, () =>
          queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
        ),
        onWsEvent(WS_EVENTS.ORDER_STATUS_UPDATED, () =>
          queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
        ),
        onWsEvent(WS_EVENTS.ORDER_ITEM_STATUS_UPDATED, ({ order_id }) => {
          queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(order_id) })
          queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
        }),
      ]
    }

    const cancelSetup = runWhenConnected(setup)

    return () => {
      cancelSetup()
      listenerCleanups.forEach((fn) => fn())
    }
  }, [queryClient])
}
