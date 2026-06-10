import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { listMenuItems, listMenuCategories, type ListMenuItemsParams } from '@/services/menu.service'
import type { MenuItem } from '@/types/entities'

export const MENU_ITEM_KEYS = {
  all:  ['menu-items'] as const,
  list: (params: ListMenuItemsParams) => ['menu-items', params] as const,
}

export const MENU_CATEGORY_KEYS = {
  all: ['menu-categories'] as const,
}

export function useMenuItems(params: ListMenuItemsParams = {}) {
  const query = useInfiniteQuery({
    queryKey: MENU_ITEM_KEYS.list(params),
    queryFn: ({ pageParam }) => listMenuItems({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 30_000,
  })

  const items: MenuItem[] = query.data?.pages.flatMap((p) => p.data) ?? []
  const isEmpty = items.length === 0 && !query.isLoading

  return { ...query, items, isEmpty }
}

export function useMenuCategories() {
  return useQuery({
    queryKey: MENU_CATEGORY_KEYS.all,
    queryFn: listMenuCategories,
    staleTime: 5 * 60_000,
    select: (data) => data.data,
  })
}
