export const TABLE_STATUSES = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'PAID'] as const
export type TableStatus = (typeof TABLE_STATUSES)[number]

export const MANUAL_TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED'] as const
export type ManualTableStatus = (typeof MANUAL_TABLE_STATUSES)[number]
