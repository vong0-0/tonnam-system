import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeChannel, onWsEvent, runWhenConnected } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS, type WsChannel } from '@/constants/socket'
import { TABLE_KEYS } from '@/hooks/useTables'
import { BILL_KEYS } from '@/hooks/useBills'

export function useTableDetailRealtime(tableId: string, billId?: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tableId) return

    const unsubChannels = [
      runWhenConnected(() => subscribeChannel(WS_CHANNELS.TABLES)),
      runWhenConnected(() => subscribeChannel(WS_CHANNELS.ORDERS)),
      runWhenConnected(() => subscribeChannel(`table:${tableId}` as WsChannel)),
    ]

    const unsubs = [
      onWsEvent(WS_EVENTS.TABLE_STATUS_UPDATED, (data) => {
        if (data.table_id !== tableId) return
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.detail(tableId) })
      }),

      onWsEvent(WS_EVENTS.TABLE_MOVED, (data) => {
        if (data.from_table_id !== tableId && data.to_table_id !== tableId) return
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.detail(tableId) })
      }),

      onWsEvent(WS_EVENTS.BILL_CREATED, (data) => {
        if (data.bill.table_id !== tableId) return
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.detail(tableId) })
      }),

      onWsEvent(WS_EVENTS.BILL_UPDATED, (data) => {
        if (!billId || data.bill._id !== billId) return
        queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(billId) })
      }),

      onWsEvent(WS_EVENTS.BILL_STATUS_UPDATED, (data) => {
        if (data.table_id && data.table_id !== tableId) return
        queryClient.invalidateQueries({ queryKey: TABLE_KEYS.detail(tableId) })
        if (billId) queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(billId) })
      }),

      onWsEvent(WS_EVENTS.ORDER_NEW_ORDER_RECEIVED, (data) => {
        if (!billId || String(data.order.bill_id) !== billId) return
        queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(billId) })
      }),

      onWsEvent(WS_EVENTS.ORDER_ITEM_STATUS_UPDATED, () => {
        if (!billId) return
        queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(billId) })
      }),
    ]

    return () => {
      unsubChannels.forEach((fn) => fn())
      unsubs.forEach((fn) => fn())
    }
  }, [queryClient, tableId, billId])
}
