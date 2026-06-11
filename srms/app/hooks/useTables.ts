import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTables, getTableById, createTable, moveTable, updateTableStatus } from '@/services/table.service'
import type { ManualTableStatus } from '@/services/table.service'
import type { CreateTableInput } from '@/schemas/table.schema'
import type { Table } from '@/types/entities'
import type { TableStatus } from '@/types/enums'
import { toastSuccess, toastError } from '@/lib/toast'

export interface UseTablesParams {
  search?: string
  status?: TableStatus | 'ALL'
  is_temporary?: boolean
  limit?: number
}

export const TABLE_KEYS = {
  all:    ['tables'] as const,
  list:   (params: UseTablesParams) => ['tables', params] as const,
  detail: (id: string) => ['tables', id] as const,
}

export function useTables(params: UseTablesParams = {}) {
  const { status, ...rest } = params

  const query = useInfiniteQuery({
    queryKey: TABLE_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      listTables({
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

  const tables: Table[] = query.data?.pages.flatMap((page) => page.data) ?? []
  const isEmpty = tables.length === 0 && !query.isLoading

  return { ...query, tables, isEmpty }
}

export function useTable(id: string) {
  return useQuery<Table>({
    queryKey: TABLE_KEYS.detail(id),
    queryFn:  () => getTableById(id),
    enabled:  !!id,
    staleTime: 30_000,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTableInput) => createTable(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ເພີ່ມໂຕະສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດເພີ່ມໂຕະໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useMoveTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sourceId, targetTableId }: { sourceId: string; targetTableId: string }) =>
      moveTable(sourceId, { target_table_id: targetTableId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ຍ້າຍໂຕະສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດຍ້າຍໂຕະໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ManualTableStatus }) =>
      updateTableStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ອັປເດດສະຖານະໂຕະສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດອັປເດດສະຖານະໂຕະໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
