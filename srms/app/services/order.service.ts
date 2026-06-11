import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { Order, OrderWithItems } from '@/types/entities'
import type { OrderStatus } from '@/types/enums'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface ListOrdersParams {
  page?: number
  limit?: number
  bill_id?: string
  status?: OrderStatus | 'ALL'
  date?: string  // format: YYYY-MM-DD
}

export interface CreateOrderBody {
  bill_id: string
  items: Array<{
    menu_item_id: string
    quantity: number
    note?: string
  }>
}

export interface UpdateOrderItemBody {
  status: 'COOKED' | 'CANCELLED'
  reason?: string | null
}

export async function listOrders(params: ListOrdersParams = {}): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<PaginatedResponse<Order>>(API.ORDERS, {
    params: sanitizeParams(params),
  })
  return data
}

export async function getOrderById(id: string): Promise<OrderWithItems> {
  const { data } = await api.get<ApiResponse<OrderWithItems>>(API.ORDER(id))
  return data.data
}

export async function createOrder(body: CreateOrderBody): Promise<OrderWithItems> {
  const { data } = await api.post<ApiResponse<OrderWithItems>>(API.ORDERS, body)
  return data.data
}

export async function updateOrderItem(
  orderId: string,
  itemId: string,
  body: UpdateOrderItemBody,
): Promise<OrderWithItems> {
  const { data } = await api.patch<ApiResponse<OrderWithItems>>(API.ORDER_ITEM(orderId, itemId), body)
  return data.data
}
