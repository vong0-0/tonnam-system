import { QueryCache, QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // 401s are handled by the Axios interceptor — log everything else
      console.error('[QueryCache]', error)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime:           30_000,
      retry:               1,
      refetchOnWindowFocus: false,
    },
  },
})
