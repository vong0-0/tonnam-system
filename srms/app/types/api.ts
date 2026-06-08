export interface ApiResponse<T> {
  success:   boolean
  message:   string
  data:      T
  timestamp: string
}

export interface Pagination {
  page:       number
  limit:      number
  total:      number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success:    boolean
  message:    string
  data:       T[]
  pagination: Pagination
  timestamp:  string
}

export interface ApiError {
  type:      string
  title:     string
  status:    number
  detail:    string
  instance:  string
  traceId:   string
  timestamp: string
  errors?: Array<{
    field:   string
    message: string
    code:    string
  }>
}
