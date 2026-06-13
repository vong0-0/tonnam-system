import { useQuery } from '@tanstack/react-query'
import {
  getSalesSummary,
  getMenuBestSellers,
  type GetSalesSummaryParams,
  type GetMenuBestSellersParams,
} from '@/services/analytics.service'

export const ANALYTICS_KEYS = {
  all:          ['analytics'] as const,
  summary:      (params: GetSalesSummaryParams) => ['analytics', 'summary', params] as const,
  bestSellers:  (params: GetMenuBestSellersParams) => ['analytics', 'best-sellers', params] as const,
}

export function useSalesSummary(params: GetSalesSummaryParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.summary(params),
    queryFn:  () => getSalesSummary(params),
    staleTime: 0,
  })
}

export function useMenuBestSellers(params: GetMenuBestSellersParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.bestSellers(params),
    queryFn:  () => getMenuBestSellers(params),
    staleTime: 0,
  })
}
