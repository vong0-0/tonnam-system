import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  listPublicMenuCategories,
  listPublicMenuItems,
  type ListPublicMenuItemsParams,
  type PublicMenuItem,
} from '@/services/public-menu.service'

export const PUBLIC_MENU_KEYS = {
  items: (params: ListPublicMenuItemsParams) => ['public-menu-items', params] as const,
  categories: ['public-menu-categories'] as const,
}

export function usePublicMenuItems(params: ListPublicMenuItemsParams = {}) {
  const query = useInfiniteQuery({
    queryKey: PUBLIC_MENU_KEYS.items(params),
    queryFn: ({ pageParam }) => listPublicMenuItems({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 30_000,
  })

  const items: PublicMenuItem[] = query.data?.pages.flatMap((page) => page.data) ?? []
  return { ...query, items }
}

export function usePublicMenuCategories() {
  return useQuery({
    queryKey: PUBLIC_MENU_KEYS.categories,
    queryFn: listPublicMenuCategories,
    staleTime: 5 * 60_000,
  })
}
