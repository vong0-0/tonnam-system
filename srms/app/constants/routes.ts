export const ROUTES = {
  LOGIN:        '/login',
  SELECT:       '/select',
  UNAUTHORIZED: '/unauthorized',
  PROFILE: '/profile',

  POS:               '/pos',
  POS_RESERVATIONS:  '/pos/reservations',
  POS_BILL:          (id: string) => `/pos/bills/${id}`,
  POS_BILL_NEW_ORDER:(id: string) => `/pos/bills/${id}/orders/new`,
  POS_BILL_PAYMENT:  (id: string) => `/pos/bills/${id}/payment`,

  WAITER:          '/waiter',
  WAITER_TABLE:    (id: string) => `/waiter/tables/${id}`,
  WAITER_ORDER_NEW:'/waiter/orders/new',
  WAITER_ORDER:    (id: string) => `/waiter/orders/${id}`,

  KITCHEN:         '/kitchen',
  KITCHEN_HISTORY: '/kitchen/history',

  ADMIN:              '/admin',
  ADMIN_ANALYTICS:    '/admin/analytics',
  ADMIN_TABLES:       '/admin/tables',
  ADMIN_MENU:         '/admin/menu',
  ADMIN_USERS:        '/admin/users',
  ADMIN_RESERVATIONS: '/admin/reservations',
  ADMIN_AUDIT_LOGS:   '/admin/audit-logs',
  ADMIN_BILLS:        '/admin/bills',
} as const
