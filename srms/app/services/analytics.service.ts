import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type {
  SalesSummary,
  SalesComparison,
  SalesByCategory,
  MenuBestSellers,
  MenuDeadItems,
  MenuMix,
  AnalyticsPeriod,
} from '@/types/analytics'
import type { ApiResponse } from '@/types/api'

export interface GetSalesSummaryParams {
  period: AnalyticsPeriod
  date: string
}

export async function getSalesSummary(params: GetSalesSummaryParams): Promise<SalesSummary> {
  const { data } = await api.get<ApiResponse<SalesSummary>>(API.ANALYTICS.SALES_SUMMARY, {
    params: sanitizeParams(params),
  })
  return data.data
}

export interface GetMenuBestSellersParams {
  period: AnalyticsPeriod
  date: string
  limit?: number
}

export async function getMenuBestSellers(params: GetMenuBestSellersParams): Promise<MenuBestSellers> {
  const { data } = await api.get<ApiResponse<MenuBestSellers>>(API.ANALYTICS.BEST_SELLERS, {
    params: sanitizeParams(params),
  })
  return data.data
}

export interface GetSalesComparisonParams {
  period: AnalyticsPeriod
  current_date: string
  previous_date: string
}

export async function getSalesComparison(params: GetSalesComparisonParams): Promise<SalesComparison> {
  const { data } = await api.get<ApiResponse<SalesComparison>>(API.ANALYTICS.SALES_COMPARISON, {
    params: sanitizeParams(params),
  })
  return data.data
}

export interface GetSalesByCategoryParams {
  period: AnalyticsPeriod
  date: string
}

export async function getSalesByCategory(params: GetSalesByCategoryParams): Promise<SalesByCategory> {
  const { data } = await api.get<ApiResponse<SalesByCategory>>(API.ANALYTICS.SALES_BY_CATEGORY, {
    params: sanitizeParams(params),
  })
  return data.data
}

export interface GetMenuDeadItemsParams {
  period: Exclude<AnalyticsPeriod, 'daily'>
  date: string
  threshold?: number
}

export async function getMenuDeadItems(params: GetMenuDeadItemsParams): Promise<MenuDeadItems> {
  const { data } = await api.get<ApiResponse<MenuDeadItems>>(API.ANALYTICS.DEAD_ITEMS, {
    params: sanitizeParams(params),
  })
  return data.data
}

export interface GetMenuMixParams {
  period: AnalyticsPeriod
  date: string
  category_id?: string
}

export async function getMenuMix(params: GetMenuMixParams): Promise<MenuMix> {
  const { data } = await api.get<ApiResponse<MenuMix>>(API.ANALYTICS.MENU_MIX, {
    params: sanitizeParams(params),
  })
  return data.data
}
