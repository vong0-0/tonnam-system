import { useQuery } from '@tanstack/react-query'
import {
  getSalesSummary,
  getMenuBestSellers,
  getSalesComparison,
  getSalesByCategory,
  getMenuDeadItems,
  getMenuMix,
  type GetSalesSummaryParams,
  type GetMenuBestSellersParams,
  type GetSalesComparisonParams,
  type GetSalesByCategoryParams,
  type GetMenuDeadItemsParams,
  type GetMenuMixParams,
} from '@/services/analytics.service'

export const ANALYTICS_KEYS = {
  all:         ['analytics'] as const,
  summary:     (p: GetSalesSummaryParams)    => ['analytics', 'summary', p] as const,
  comparison:  (p: GetSalesComparisonParams) => ['analytics', 'comparison', p] as const,
  byCategory:  (p: GetSalesByCategoryParams) => ['analytics', 'by-category', p] as const,
  bestSellers: (p: GetMenuBestSellersParams) => ['analytics', 'best-sellers', p] as const,
  deadItems:   (p: GetMenuDeadItemsParams)   => ['analytics', 'dead-items', p] as const,
  menuMix:     (p: GetMenuMixParams)         => ['analytics', 'menu-mix', p] as const,
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

export function useSalesComparison(params: GetSalesComparisonParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.comparison(params),
    queryFn:  () => getSalesComparison(params),
    staleTime: 0,
  })
}

export function useSalesByCategory(params: GetSalesByCategoryParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.byCategory(params),
    queryFn:  () => getSalesByCategory(params),
    staleTime: 0,
  })
}

export function useMenuDeadItems(params: GetMenuDeadItemsParams | null) {
  return useQuery({
    queryKey: params ? ANALYTICS_KEYS.deadItems(params) : ['analytics', 'dead-items', null],
    queryFn:  () => getMenuDeadItems(params!),
    enabled:  params !== null,
    staleTime: 0,
  })
}

export function useMenuMix(params: GetMenuMixParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.menuMix(params),
    queryFn:  () => getMenuMix(params),
    staleTime: 0,
  })
}
