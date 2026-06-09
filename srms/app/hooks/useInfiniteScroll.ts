import { useRef, useEffect, type RefObject } from 'react'

interface UseInfiniteScrollOptions {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  rootMargin?: string
  threshold?: number
  /** Scroll container element to use as IntersectionObserver root.
   *  Pass a DOM node (via useState callback ref) when the list lives inside
   *  an overflow container — NOT a RefObject, so changes trigger re-runs. */
  root?: HTMLElement | null
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  rootMargin = '100px',
  threshold = 0,
  root,
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
      { root: root ?? null, rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, root, rootMargin, threshold])

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
