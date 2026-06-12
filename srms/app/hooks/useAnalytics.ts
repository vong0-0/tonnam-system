import { useQuery } from '@tanstack/react-query'
import { getSalesSummary, type GetSalesSummaryParams } from '@/services/analytics.service'

export const ANALYTICS_KEYS = {
  all:     ['analytics'] as const,
  summary: (params: GetSalesSummaryParams) => ['analytics', 'summary', params] as const,
}

export function useSalesSummary(params: GetSalesSummaryParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.summary(params),
    queryFn:  () => getSalesSummary(params),
    staleTime: 0,
  })
}
