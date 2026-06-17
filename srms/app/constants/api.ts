export const API = {
  AUTH: {
    LOGIN:     '/v1/auth/login',
    REFRESH:   '/v1/auth/refresh',
    LOGOUT:    '/v1/auth/logout',
    WS_TICKET: '/v1/auth/ws-ticket',
    ME:        '/v1/auth/me',
  },

  USERS: '/v1/users',
  USER:  (id: string) => `/v1/users/${id}`,

  TABLES:       '/v1/tables',
  TABLE:        (id: string) => `/v1/tables/${id}`,
  TABLE_STATUS: (id: string) => `/v1/tables/${id}/status`,
  TABLE_MOVE:   (id: string) => `/v1/tables/${id}/move`,

  TABLE_MERGE_GROUPS:        '/v1/table-merge-groups',
  TABLE_MERGE_GROUP:         (id: string) => `/v1/table-merge-groups/${id}`,
  TABLE_MERGE_GROUP_UNMERGE: (id: string) => `/v1/table-merge-groups/${id}/unmerge`,

  MENU_CATEGORIES:        '/v1/menu-categories',
  MENU_CATEGORY:          (id: string) => `/v1/menu-categories/${id}`,
  MENU_ITEMS:             '/v1/menu-items',
  MENU_ITEM_IMAGE:        '/v1/menu-items/image',
  MENU_ITEM:              (id: string) => `/v1/menu-items/${id}`,
  MENU_ITEM_AVAILABILITY: (id: string) => `/v1/menu-items/${id}/availability`,

  RESERVATIONS:       '/v1/reservations',
  RESERVATION:        (id: string) => `/v1/reservations/${id}`,
  RESERVATION_STATUS: (id: string) => `/v1/reservations/${id}/status`,

  BILLS:       '/v1/bills',
  BILL:        (id: string) => `/v1/bills/${id}`,
  BILL_STATUS: (id: string) => `/v1/bills/${id}/status`,
  BILL_SPLIT:  (id: string) => `/v1/bills/${id}/split`,

  ORDERS:         '/v1/orders',
  ORDER:          (id: string) => `/v1/orders/${id}`,
  ORDER_ITEM:     (orderId: string, itemId: string) => `/v1/orders/${orderId}/items/${itemId}`,
  ORDER_ITEM_QTY: (orderId: string, itemId: string) => `/v1/orders/${orderId}/items/${itemId}/quantity`,

  PAYMENTS: '/v1/payments',
  PAYMENT:  (id: string) => `/v1/payments/${id}`,

  AUDIT_LOGS: '/v1/audit-logs',
  AUDIT_LOG:  (id: string) => `/v1/audit-logs/${id}`,

  ANALYTICS: {
    SALES_SUMMARY:     '/v1/analytics/sales/summary',
    SALES_COMPARISON:  '/v1/analytics/sales/comparison',
    SALES_BY_CATEGORY: '/v1/analytics/sales/by-category',
    BEST_SELLERS:      '/v1/analytics/menu/best-sellers',
    DEAD_ITEMS:        '/v1/analytics/menu/dead-items',
    MENU_MIX:          '/v1/analytics/menu/mix',
  },
} as const
