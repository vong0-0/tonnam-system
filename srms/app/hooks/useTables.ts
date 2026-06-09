import { useInfiniteQuery } from '@tanstack/react-query'
import { listTables } from '@/services/table.service'
import type { Table } from '@/types/entities'
import type { TableStatus } from '@/types/enums'

export interface UseTablesParams {
  search?: string
  status?: TableStatus | 'ALL'
  is_temporary?: boolean
  limit?: number
}

export const TABLE_KEYS = {
  all:  ['tables'] as const,
  list: (params: UseTablesParams) => ['tables', params] as const,
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
