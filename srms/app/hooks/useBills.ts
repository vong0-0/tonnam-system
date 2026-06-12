import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBills, getBillById, createBill, cancelBill } from '@/services/bill.service'
import type { Bill, BillDetail } from '@/types/entities'
import { TABLE_KEYS } from '@/hooks/useTables'
import type { BillStatus } from '@/types/enums'
import { toastSuccess, toastError } from '@/lib/toast'

export interface UseBillsParams {
  search?: string
  table_id?: string
  status?: BillStatus | 'ALL'
  limit?: number
}

export const BILL_KEYS = {
  all:    ['bills'] as const,
  list:   (params: UseBillsParams) => ['bills', params] as const,
  detail: (id: string) => ['bills', id] as const,
}

export function useBills(params: UseBillsParams = {}) {
  const { status, ...rest } = params

  const query = useInfiniteQuery({
    queryKey: BILL_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      listBills({
        ...rest,
        page: pageParam,
        ...(status && status !== 'ALL' ? { status } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 30_000,
  })

  const bills: Bill[] = query.data?.pages.flatMap((page) => page.data) ?? []
  const isEmpty = bills.length === 0 && !query.isLoading

  return { ...query, bills, isEmpty }
}

export function useBill(id: string) {
  return useQuery<BillDetail>({
    queryKey: BILL_KEYS.detail(id),
    queryFn:  () => getBillById(id),
    enabled:  !!id,
    staleTime: 30_000,
  })
}

export function useCancelBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelBill(id, { status: 'CANCELLED', reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ຍົກເລີກບິນສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດຍົກເລີກບິນໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { table_id: string; name?: string }) => createBill(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ເປີດບິນສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດເປີດບິນໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
