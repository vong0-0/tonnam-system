import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { Table } from '@/types/entities'
import type { TableStatus } from '@/types/enums'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { CreateTableInput, UpdateTableInput } from '@/schemas/table.schema'

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

export interface MoveTableResult {
  id: string
  table_name: string
  status: TableStatus
}

export async function moveTable(
  sourceId: string,
  body: { target_table_id: string },
): Promise<{ from_table: MoveTableResult; to_table: MoveTableResult }> {
  const { data } = await api.post<ApiResponse<{ from_table: MoveTableResult; to_table: MoveTableResult }>>(
    API.TABLE_MOVE(sourceId),
    body,
  )
  return data.data
}

export async function createTable(body: CreateTableInput): Promise<Table> {
  const { data } = await api.post<ApiResponse<Table>>(API.TABLES, body)
  return data.data
}

export async function updateTable(
  id: string,
  body: UpdateTableInput,
): Promise<Table> {
  const { data } = await api.patch<ApiResponse<Table>>(API.TABLE(id), body)
  return data.data
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(API.TABLE(id))
}

export type ManualTableStatus = 'AVAILABLE' | 'OCCUPIED'

export async function updateTableStatus(
  id: string,
  body: { status: ManualTableStatus },
): Promise<Table> {
  const { data } = await api.patch<ApiResponse<Table>>(API.TABLE_STATUS(id), body)
  return data.data
}
