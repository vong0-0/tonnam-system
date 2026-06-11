import { Loader2, UtensilsCrossed } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import KitchenOrderCard from '@/components/kitchen/KitchenOrderCard'
import { useOrders } from '@/hooks/useOrders'
import { isToday } from '@/lib/date'
import { OrderStatus } from '@/types/enums'

export default function KitchenIndexPage() {
  const { orders, isLoading } = useOrders({ status: OrderStatus.SENT_TO_KITCHEN })

  const todayOrders = orders.filter((o) => isToday(o.created_at))

  return (
    <div className="flex flex-col gap-3 my-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-ink-300" />
        </div>
      ) : todayOrders.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="ບໍ່ມີ order"
          description="ບໍ່ມີ order ທີ່ລໍຖ້າການປຸງອາຫານ"
        />
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {todayOrders.map((order) => (
            <KitchenOrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
