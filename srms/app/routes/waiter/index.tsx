import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDebounce } from 'use-debounce'
import { TableProperties } from 'lucide-react'
import Filterbar from '@/components/waiter/filterbar'
import TableCard from '@/components/waiter/TableCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useTables } from '@/hooks/useTables'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { ROUTES } from '@/constants/routes'
import type { TableStatus } from '@/types/enums'

export default function WaiterIndex() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const [debouncedSearch] = useDebounce(search, 300)

  const {
    tables,
    isEmpty,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTables({
    search: debouncedSearch,
    status: status ? (status as TableStatus | 'ALL') : undefined,
  })

  const sentinelRef = useInfiniteScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })

  return (
    <div className="flex flex-col h-full">
      <Filterbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-danger">ໂຫລດຂໍ້ມູນບໍ່ໄດ້ ກະລຸນາລອງໃໝ່</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2">
              {tables.map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  onClick={() => navigate(ROUTES.WAITER_TABLE(table._id))}
                />
              ))}
            </div>

            {isEmpty && (
              <EmptyState
                icon={TableProperties}
                title="ບໍ່ພົບໂຕະ"
                description="ບໍ່ມີໂຕະທີ່ກົງກັບການຄົ້ນຫາຂອງທ່ານ ລອງປ່ຽນຕົວກອງໃໝ່"
              />
            )}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div ref={sentinelRef} />
          </>
        )}
      </div>
    </div>
  )
}
