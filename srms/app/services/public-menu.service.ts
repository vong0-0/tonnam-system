import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface PublicMenuItem {
  _id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
}

export interface PublicMenuCategory {
  _id: string
  name: string
  item_count: number
}

export interface ListPublicMenuItemsParams {
  page?: number
  limit?: number
  search?: string
  category_id?: string
}

export async function listPublicMenuItems(
  params: ListPublicMenuItemsParams = {},
): Promise<PaginatedResponse<PublicMenuItem>> {
  const { data } = await api.get<PaginatedResponse<PublicMenuItem>>(API.PUBLIC_MENU_ITEMS, {
    params: sanitizeParams(params),
  })
  return data
}

export async function listPublicMenuCategories(): Promise<PublicMenuCategory[]> {
  const { data } = await api.get<ApiResponse<PublicMenuCategory[]>>(API.PUBLIC_MENU_CATEGORIES)
  return data.data
}
