export const WS_EVENTS = {
  TABLE_STATUS_UPDATED: 'table:status_updated',
  TABLE_MERGED: 'table:merged',
  TABLE_UNMERGED: 'table:unmerged',
  TABLE_MOVED: 'table:moved',
  BILL_CREATED: 'bill:created',
  BILL_STATUS_UPDATED: 'bill:status_updated',
  BILL_UPDATED: 'bill:updated',
  BILL_PAYMENT_CONFIRMED: 'bill:payment_confirmed',
  ORDER_NEW_ORDER_RECEIVED: 'order:new_order_received',
  ORDER_ITEM_STATUS_UPDATED: 'order:item_status_updated',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  MENU_ITEM_AVAILABILITY_UPDATED: 'menu:item_availability_updated',
  SYSTEM_TOKEN_EXPIRED: 'system:token_expired',
  SYSTEM_FORCE_LOGOUT: 'system:force_logout',
} as const

export const WS_CHANNELS = {
  TABLES: 'tables',
  ORDERS: 'orders',
  MENU: 'menu',
  KITCHEN: 'kitchen',
} as const
