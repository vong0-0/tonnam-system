import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listMenuItems,
  listMenuCategories,
  updateMenuItemAvailability,
  listAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  type ListMenuItemsParams,
  type UpdateMenuItemAvailabilityInput,
} from '@/services/menu.service'
import type { CreateMenuItemInput, UpdateMenuItemInput, CreateMenuCategoryInput, UpdateMenuCategoryInput } from '@/schemas/menu.schema'
import type { MenuItem } from '@/types/entities'
import { toastSuccess, toastError } from '@/lib/toast'

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

export function useUpdateMenuItemAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateMenuItemAvailabilityInput) =>
      updateMenuItemAvailability(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
    },
  })
}

export function useAdminMenuItems() {
  return useQuery({
    queryKey: MENU_ITEM_KEYS.list({ limit: 500 }),
    queryFn:  listAllMenuItems,
    staleTime: 30_000,
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMenuItemInput) => createMenuItem(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
      toastSuccess('ເພີ່ມເມນູສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດເພີ່ມເມນູໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateMenuItemInput) =>
      updateMenuItem(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
      toastSuccess('ແກ້ໄຂເມນູສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດແກ້ໄຂເມນູໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUploadMenuImage() {
  return useMutation({
    mutationFn: (file: File) => uploadMenuImage(file),
    onError: (error) => {
      toastError(error, 'ອັບໂຫລດຮູບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
      toastSuccess('ລົບເມນູສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດລົບເມນູໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useCreateMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMenuCategoryInput) => createMenuCategory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
      toastSuccess('ເພີ່ມໝວດໝູ່ສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດເພີ່ມໝວດໝູ່ໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateMenuCategoryInput) =>
      updateMenuCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
      toastSuccess('ແກ້ໄຂໝວດໝູ່ສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດແກ້ໄຂໝວດໝູ່ໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMenuCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: MENU_ITEM_KEYS.all })
      toastSuccess('ລົບໝວດໝູ່ສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດລົບໝວດໝູ່ໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
