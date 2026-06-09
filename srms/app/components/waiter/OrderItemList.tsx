import { cn, formatNumber } from '@/lib/utils'
import { DATE_FORMATS, formatDate } from '@/lib/date'
import OrderItemStatusBadge from '@/components/common/OrderItemStatusBadge'
import { OrderStatus } from '@/types/enums'
import type { OrderWithItems } from '@/types/entities'

interface OrderItemListProps {
  orders: OrderWithItems[]
  className?: string
}

const orderStatusConfig: Record<OrderStatus, { label: string; color: string }> = {
  SENT_TO_KITCHEN: { label: 'ໃນຄົວ', color: '#B37D00' },
  COOKED: { label: 'ເຮັດສຳເລັດ', color: '#0F9B8E' },
  CANCELLED: { label: 'ຍົກເລີກ', color: '#C0392B' },
}

export default function OrderItemList({ orders, className }: OrderItemListProps) {
  if (!orders.length) return null

  return (
    <div className={cn('space-y-3', className)}>
      {orders.map((order) => {
        const { label, color } = orderStatusConfig[order.status]

        return (
          <div
            key={order.id}
            className="rounded-xl border border-ink-100 bg-paper overflow-hidden shadow-sm"
          >
            {/* Order header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-ink-50 border-b border-ink-100">

              <div className="text-sm font-semibold text-ink-900 font-mono tracking-tight">
                {order.short_id}
              </div>


              <div className="text-xs text-ink-400">
                {order.created_at ? formatDate(order.created_at, DATE_FORMATS.TIME) : '-'} ໂມງ
              </div>
            </div>

            {/* Item rows */}
            <ul>
              {order.items.map((item, idx) => {
                const isCancelled = item.status === 'CANCELLED'

                return (
                  <li
                    key={item.id}
                    className={cn(
                      'px-4 py-3',
                      idx < order.items.length - 1 && 'border-b border-ink-100',
                    )}
                  >
                    <div className="flex items-start gap-3">

                      {/* Name + quantity + notes */}
                      <div className="flex-1 flex flex-items gap-1 flex-col min-w-0">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            isCancelled ? 'text-ink-300 line-through' : 'text-ink-900',
                          )}
                        >
                          {item.name}
                        </p>
                        <p
                          className="text-zinc-500 text-sm"
                        >
                          ຈຳນວນ: {item.quantity}
                        </p>
                        {item.notes && !isCancelled && (
                          <p className="text-xs text-gold mt-0.5 leading-tight">
                            ຫມາຍເຫດ: {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Price + badge */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={cn(
                            'text-sm font-medium tabular-nums',
                            isCancelled ? 'text-ink-300 line-through' : 'text-ink-700',
                          )}
                        >
                          ₭{formatNumber(item.unit_price * item.quantity)}
                        </span>
                        <OrderItemStatusBadge status={item.status} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
