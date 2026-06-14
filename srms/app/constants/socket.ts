export const WS_EVENTS = {
  // Table
  TABLE_CREATED:        'table:created',
  TABLE_UPDATED:        'table:updated',
  TABLE_DELETED:        'table:deleted',
  TABLE_STATUS_UPDATED: 'table:status_updated',
  TABLE_MERGED:         'table:merged',
  TABLE_UNMERGED:       'table:unmerged',
  TABLE_MOVED:          'table:moved',

  // Bill
  BILL_CREATED:           'bill:created',
  BILL_UPDATED:           'bill:updated',
  BILL_STATUS_UPDATED:    'bill:status_updated',
  BILL_PAYMENT_CONFIRMED: 'bill:payment_confirmed',

  // Order
  ORDER_NEW_ORDER_RECEIVED:  'order:new_order_received',
  ORDER_ITEM_STATUS_UPDATED: 'order:item_status_updated',
  ORDER_STATUS_UPDATED:      'order:status_updated',

  // Menu
  MENU_ITEM_CREATED:              'menu:item_created',
  MENU_ITEM_UPDATED:              'menu:item_updated',
  MENU_ITEM_DELETED:              'menu:item_deleted',
  MENU_ITEM_AVAILABILITY_UPDATED: 'menu:item_availability_updated',
  MENU_CATEGORY_CREATED:          'menu:category_created',
  MENU_CATEGORY_UPDATED:          'menu:category_updated',
  MENU_CATEGORY_DELETED:          'menu:category_deleted',

  // Reservation
  RESERVATION_CREATED:        'reservation:created',
  RESERVATION_UPDATED:        'reservation:updated',
  RESERVATION_STATUS_UPDATED: 'reservation:status_updated',
  RESERVATION_DELETED:        'reservation:deleted',

  // System
  SYSTEM_TOKEN_EXPIRED: 'system:token_expired',
  SYSTEM_FORCE_LOGOUT:  'system:force_logout',
} as const

export const WS_CHANNELS = {
  TABLES:       'tables',
  ORDERS:       'orders',
  MENU:         'menu',
  KITCHEN:      'kitchen',
  RESERVATIONS: 'reservations',
} as const

export type WsEvent   = (typeof WS_EVENTS)[keyof typeof WS_EVENTS]
export type WsChannel = (typeof WS_CHANNELS)[keyof typeof WS_CHANNELS]
