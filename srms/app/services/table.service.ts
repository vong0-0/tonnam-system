import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { Table } from '@/types/entities'
import type { TableStatus } from '@/types/enums'
import type { PaginatedResponse } from '@/types/api'

export interface ListTablesParams {
  page?: number
  limit?: number
  search?: string
  status?: TableStatus
  is_temporary?: boolean
}

export async function listTables(params: ListTablesParams = {}): Promise<PaginatedResponse<Table>> {
  const { data } = await api.get<PaginatedResponse<Table>>(API.TABLES, {
    params: sanitizeParams(params),
  })
  return data
}

export async function getTableById(id: string): Promise<Table> {
  const { data } = await api.get<{ data: Table }>(API.TABLE(id))
  return data.data
}
