import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Loader2, ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import KitchenOrderCard from '@/components/kitchen/KitchenOrderCard'
import { SearchInput } from '@/components/common/SearchInput'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { DatePickerFilter } from '@/components/common/DatePickerFilter'
import { useOrders } from '@/hooks/useOrders'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import { OrderStatus } from '@/types/enums'
import type { Order } from '@/types/entities'

const statusOptions: SelectOption[] = [
  { value: 'ALL',                       label: 'ທຸກສະຖານະ' },
  { value: OrderStatus.SENT_TO_KITCHEN, label: 'ລໍຖ້າ' },
  { value: OrderStatus.COOKED,          label: 'ສຳເລັດ' },
  { value: OrderStatus.CANCELLED,       label: 'ຍົກເລີກ' },
]

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
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

export default function KitchenOrderHistoryPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [debouncedSearch] = useDebounce(search, 300)

  const {
    orders,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders({
    status: status as OrderStatus | 'ALL',
    ...(selectedDate ? { date: formatDate(selectedDate, DATE_FORMATS.DATE_ISO) } : {}),
  })

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  })

  const displayOrders = orders.filter((o) =>
    !debouncedSearch || o.short_id.toLowerCase().includes(debouncedSearch.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-3 my-4">
      <div className="flex flex-col gap-2 px-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="ຄົ້ນຫາ order..."
        />
        <div className="flex gap-2">
          <DatePickerFilter
            value={selectedDate}
            onChange={setSelectedDate}
            className="flex-1"
          />
          <AppSelect
            value={status}
            onValueChange={setStatus}
            options={statusOptions}
            placeholder="ທຸກສະຖານະ"
            triggerClassName="h-auto py-2 w-32"
          />
        </div>
      </div>

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
