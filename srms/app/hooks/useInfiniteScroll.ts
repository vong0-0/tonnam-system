import { useRef, useEffect, type RefObject } from 'react'

interface UseInfiniteScrollOptions {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  rootMargin = '100px',
  threshold = 0,
}: UseInfiniteScrollOptions): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, rootMargin, threshold])

  return ref
}

/*
  const { tables, fetchNextPage, hasNextPage, isFetchingNextPage } = useTables({ status: 'OCCUPIED' })
  const sentinelRef = useInfiniteScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })

  return (
    <div>
      {tables.map(table => <TableCard key={table.id} table={table} />)}
      <div ref={sentinelRef} />
    </div>
  )
*/
