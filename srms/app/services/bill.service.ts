import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { Bill, BillDetail, BillTable, OrderWithItems, Payment } from '@/types/entities'
import type { BillStatus } from '@/types/enums'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface ListBillsParams {
  page?: number
  limit?: number
  search?: string
  table_id?: string
  status?: BillStatus | 'ALL'
}

export async function listBills(params: ListBillsParams = {}): Promise<PaginatedResponse<Bill>> {
  const { data } = await api.get<PaginatedResponse<Bill>>(API.BILLS, {
    params: sanitizeParams(params),
  })
  return data
}

interface BillDetailResponse {
  bill: Bill
  table: BillTable
  orders: OrderWithItems[]
  payments: Payment[]
}

export async function getBillById(id: string): Promise<BillDetail> {
  const { data } = await api.get<ApiResponse<BillDetailResponse>>(API.BILL(id))
  const { bill, table, orders, payments } = data.data
  return { ...bill, table, orders, payments }
}

export async function createBill(body: { table_id: string; name?: string }): Promise<Bill> {
  const { data } = await api.post<ApiResponse<Bill>>(API.BILLS, body)
  return data.data
}

export async function updateBill(
  id: string,
  body: { name?: string; reason: string },
): Promise<Bill> {
  const { data } = await api.patch<ApiResponse<Bill>>(API.BILL(id), body)
  return data.data
}

export async function cancelBill(
  id: string,
  body: { status: 'CANCELLED'; reason: string },
): Promise<Bill> {
  const { data } = await api.patch<ApiResponse<Bill>>(API.BILL_STATUS(id), body)
  return data.data
}
