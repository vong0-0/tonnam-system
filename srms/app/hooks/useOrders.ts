import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderItem,
  type CreateOrderBody,
  type UpdateOrderItemBody,
} from '@/services/order.service'
import { BILL_KEYS } from '@/hooks/useBills'
import type { Order, OrderWithItems } from '@/types/entities'
import type { OrderStatus } from '@/types/enums'
import { toastSuccess, toastError } from '@/lib/toast'

export interface UseOrdersParams {
  bill_id?: string
  status?: OrderStatus | 'ALL'
  limit?: number
  date?: string
}

export const ORDER_KEYS = {
  all:    ['orders'] as const,
  list:   (params: UseOrdersParams) => ['orders', params] as const,
  detail: (id: string) => ['orders', id] as const,
}

export function useOrders(params: UseOrdersParams = {}) {
  const { status, ...rest } = params

  const query = useInfiniteQuery({
    queryKey: ORDER_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      listOrders({
        ...rest,
        page: pageParam,
        ...(status && status !== 'ALL' ? { status } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 15_000,
  })

  const orders: Order[] = query.data?.pages.flatMap((page) => page.data) ?? []
  const isEmpty = orders.length === 0 && !query.isLoading

  return { ...query, orders, isEmpty }
}

export function useOrder(id: string) {
  return useQuery<OrderWithItems>({
    queryKey: ORDER_KEYS.detail(id),
    queryFn:  () => getOrderById(id),
    enabled:  !!id,
    staleTime: 15_000,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderBody) => createOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all })
      toastSuccess('ສ່ງ order ສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດສ່ງ order ໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      body,
    }: {
      orderId: string
      itemId: string
      body: UpdateOrderItemBody
    }) => updateOrderItem(orderId, itemId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
      toastSuccess('ອັປເດດລາຍການສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດອັປເດດລາຍການໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
