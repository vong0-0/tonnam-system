export const TableStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED:  'RESERVED',
  OCCUPIED:  'OCCUPIED',
  PAID:      'PAID',
} as const
export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus]

export const BillStatus = {
  OPEN:      'OPEN',
  PAID:      'PAID',
  CANCELLED: 'CANCELLED',
} as const
export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus]

export const OrderStatus = {
  SENT_TO_KITCHEN: 'SENT_TO_KITCHEN',
  COOKED:          'COOKED',
  CANCELLED:       'CANCELLED',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

// null = pending — not an enum value
export const OrderItemStatus = {
  COOKED:    'COOKED',
  CANCELLED: 'CANCELLED',
} as const
export type OrderItemStatus = (typeof OrderItemStatus)[keyof typeof OrderItemStatus]

export const ReservationStatus = {
  PENDING:   'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus]

export const PaymentMethod = {
  CASH:         'CASH',
  QR_PROMPTPAY: 'QR_PROMPTPAY',
  MIXED:        'MIXED',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]
