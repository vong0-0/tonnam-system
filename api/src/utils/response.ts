export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SuccessResponse<T> {
  success: true
  message: string
  timestamp: string
  data: T
}

export interface SuccessListResponse<T> {
  success: true
  message: string
  timestamp: string
  data: T[]
  pagination: Pagination
}

export function success<T>(data: T, message: string): SuccessResponse<T> {
  return { success: true, message, timestamp: new Date().toISOString(), data }
}

export function successList<T>(
  items: T[],
  pagination: Pagination,
  message: string,
): SuccessListResponse<T> {
  return { success: true, message, timestamp: new Date().toISOString(), data: items, pagination }
}
