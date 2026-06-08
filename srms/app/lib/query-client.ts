import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

export const queryClient = new QueryClient({

  queryCache: new QueryCache({
    onError: (error, query) => {
      const status = (error as any)?.response?.status
      if (status === 401) return
      console.error(`[QueryCache] Query failed: ${String(query.queryKey)}`, error)
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      const status = (error as any)?.response?.status
      if (status === 401) return
      console.error(`[MutationCache] Mutation failed`, error)
    },
  }),

  defaultOptions: {
    queries: {
      staleTime:            30_000,
      gcTime:               5 * 60_000,
      retry:                1,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
    },
    mutations: {
      retry: 0,
    },
  },

})
