export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SuccessResponse<T> {
  success: true
  data: T
}

export interface SuccessListResponse<T> {
  success: true
  data: T[]
  pagination: Pagination
}

export function success<T>(data: T): SuccessResponse<T> {
  return { success: true, data }
}

export function successList<T>(
  items: T[],
  pagination: Pagination,
): SuccessListResponse<T> {
  return { success: true, data: items, pagination }
}
