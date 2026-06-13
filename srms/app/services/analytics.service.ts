import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { SalesSummary, MenuBestSellers, AnalyticsPeriod } from '@/types/analytics'
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
