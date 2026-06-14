import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { MenuItem, MenuCategory } from '@/types/entities'
import type { PaginatedResponse, ApiResponse } from '@/types/api'
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from '@/schemas/menu.schema'

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

export interface UpdateMenuItemAvailabilityInput {
  is_available: boolean
  is_sold_out: boolean
}

export async function updateMenuItemAvailability(
  id: string,
  input: UpdateMenuItemAvailabilityInput,
): Promise<{ data: MenuItem }> {
  const { data } = await api.patch<{ data: MenuItem }>(API.MENU_ITEM_AVAILABILITY(id), input)
  return data
}

export async function listAllMenuItems(): Promise<PaginatedResponse<MenuItem>> {
  const { data } = await api.get<PaginatedResponse<MenuItem>>(API.MENU_ITEMS, {
    params: { limit: 500 },
  })
  return data
}

export async function createMenuItem(body: CreateMenuItemInput): Promise<MenuItem> {
  const { data } = await api.post<ApiResponse<MenuItem>>(API.MENU_ITEMS, body)
  return data.data
}

export async function updateMenuItem(id: string, body: UpdateMenuItemInput): Promise<MenuItem> {
  const { data } = await api.patch<ApiResponse<MenuItem>>(API.MENU_ITEM(id), body)
  return data.data
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(API.MENU_ITEM(id))
}

export async function createMenuCategory(body: CreateMenuCategoryInput): Promise<MenuCategory> {
  const { data } = await api.post<ApiResponse<MenuCategory>>(API.MENU_CATEGORIES, body)
  return data.data
}

export async function updateMenuCategory(id: string, body: UpdateMenuCategoryInput): Promise<MenuCategory> {
  const { data } = await api.patch<ApiResponse<MenuCategory>>(API.MENU_CATEGORY(id), body)
  return data.data
}

export async function deleteMenuCategory(id: string): Promise<void> {
  await api.delete(API.MENU_CATEGORY(id))
}
