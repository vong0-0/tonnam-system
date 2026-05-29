export const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const WAITER_ALLOWED_RESERVATION_STATUSES = ['CONFIRMED'] as const
export type WaiterAllowedReservationStatus = (typeof WAITER_ALLOWED_RESERVATION_STATUSES)[number]

export const STAFF_RESERVATION_STATUSES = ['CONFIRMED', 'CANCELLED'] as const
export type StaffReservationStatus = (typeof STAFF_RESERVATION_STATUSES)[number]
