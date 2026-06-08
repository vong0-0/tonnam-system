import { create } from 'zustand'
import { onWsEvent } from '@/lib/socket'
import { WS_EVENTS } from '@/constants/socket'

interface Notification {
  id:        string
  type:      'order' | 'table' | 'bill' | 'system'
  message:   string
  createdAt: string
}

interface NotificationState {
  notifications:      Notification[]
  addNotification:    (n: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearAll:           () => void
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  addNotification: (n) =>
    set((state) => ({
      notifications: [
        { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...state.notifications,
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}))

export function initNotificationListeners(): void {
  const { addNotification } = useNotificationStore.getState()

  onWsEvent(WS_EVENTS.ORDER_NEW_ORDER_RECEIVED, (data) => {
    addNotification({ type: 'order', message: `มี order ใหม่ ${data.order.short_id}` })
  })

  onWsEvent(WS_EVENTS.ORDER_ITEM_STATUS_UPDATED, (data) => {
    addNotification({ type: 'order', message: `รายการอาหารในออเดอร์ ${data.order_id} อัปเดตแล้ว` })
  })

  onWsEvent(WS_EVENTS.TABLE_STATUS_UPDATED, (data) => {
    addNotification({ type: 'table', message: `สถานะโต๊ะเปลี่ยนเป็น ${data.status}` })
  })

  onWsEvent(WS_EVENTS.BILL_PAYMENT_CONFIRMED, (data) => {
    addNotification({ type: 'bill', message: `บิล ${data.bill_id} ชำระเงินแล้ว` })
  })

  onWsEvent(WS_EVENTS.SYSTEM_FORCE_LOGOUT, (data) => {
    addNotification({ type: 'system', message: data.message })
  })
}
