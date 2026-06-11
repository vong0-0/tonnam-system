import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'use-debounce'
import { Loader2, UtensilsCrossed } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import KitchenOrderCard from '@/components/kitchen/KitchenOrderCard'
import KitchenFilterBar from '@/components/kitchen/KitchenFilterBar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrders } from '@/hooks/useOrders'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import { OrderStatus } from '@/types/enums'
import type { Order } from '@/types/entities'

type KitchenTab = 'sent-to-kitchen' | 'all'

const TABS: { value: KitchenTab; label: string }[] = [
  { value: 'sent-to-kitchen', label: 'ລໍຖ້າ' },
  { value: 'all', label: 'ທຸກສະຖານະ' },
]

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="ບໍ່ມີ order"
        description="ບໍ່ພົບ order ທີ່ຕົງກັບເງື່ອນໄຂ"
      />
    )
  }
  return (
    <div className="flex flex-col gap-2 px-4">
      {orders.map((order) => (
        <KitchenOrderCard key={order._id} order={order} />
      ))}
    </div>
  )
}

export default function KitchenIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') ?? 'sent-to-kitchen') as KitchenTab

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [debouncedSearch] = useDebounce(search, 300)

  const today = formatDate(new Date(), DATE_FORMATS.DATE_ISO)

  const {
    orders: pendingOrders,
    isLoading: isPendingLoading,
    fetchNextPage: fetchNextPending,
    hasNextPage: hasPendingNext,
    isFetchingNextPage: isFetchingPending,
  } = useOrders({ status: OrderStatus.SENT_TO_KITCHEN, date: today })

  const {
    orders: allOrders,
    isLoading: isAllLoading,
    fetchNextPage: fetchNextAll,
    hasNextPage: hasAllNext,
    isFetchingNextPage: isFetchingAll,
  } = useOrders({ date: today })

  const isLoading = activeTab === 'sent-to-kitchen' ? isPendingLoading : isAllLoading
  const isFetchingNextPage = activeTab === 'sent-to-kitchen' ? isFetchingPending : isFetchingAll

  const sentinelRef = useInfiniteScroll({
    fetchNextPage: activeTab === 'sent-to-kitchen' ? fetchNextPending : fetchNextAll,
    hasNextPage: (activeTab === 'sent-to-kitchen' ? hasPendingNext : hasAllNext) ?? false,
    isFetchingNextPage,
  })

  const allFiltered = allOrders
    .filter((o) => status === 'ALL' || o.status === status)
    .filter((o) =>
      !debouncedSearch ||
      o.short_id.toLowerCase().includes(debouncedSearch.toLowerCase()),
    )

  const displayOrders = activeTab === 'sent-to-kitchen' ? pendingOrders : allFiltered

  return (
    <div className="flex flex-col gap-3 my-4">
      <div className="px-4 flex justify-center">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setSearch('')
            setStatus('ALL')
            setSearchParams({ tab: v }, { replace: true })
          }}
        >
          <TabsList className='group-data-horizontal/tabs:h-auto'>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className='px-4 py-2 h-auto data-[state=active]:bg-green-light data-[state=active]:text-white'>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'all' && (
        <KitchenFilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-ink-300" />
        </div>
      ) : (
        <>
          <OrderList orders={displayOrders} />
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={20} className="animate-spin text-ink-300" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
