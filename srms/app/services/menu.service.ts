import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { MenuItem, MenuCategory } from '@/types/entities'
import type { PaginatedResponse } from '@/types/api'

export interface ListMenuItemsParams {
  page?: number
  limit?: number
  search?: string
  category_id?: string
}

export async function listMenuItems(
  params: ListMenuItemsParams = {},
): Promise<PaginatedResponse<MenuItem>> {
  const { data } = await api.get<PaginatedResponse<MenuItem>>(API.MENU_ITEMS, {
    params: sanitizeParams(params),
  })
  return data
}

export async function listMenuCategories(): Promise<PaginatedResponse<MenuCategory>> {
  const { data } = await api.get<PaginatedResponse<MenuCategory>>(API.MENU_CATEGORIES, {
    params: { limit: 100 },
  })
  return data
}
