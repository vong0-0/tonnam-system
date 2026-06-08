export const ROLES = {
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',
  WAITER: 'WAITER',
  KITCHEN: 'KITCHEN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_ROUTES: Record<Role, string> = {
  ADMIN: '/admin',
  CASHIER: '/pos',
  WAITER: '/waiter',
  KITCHEN: '/kitchen',
}
