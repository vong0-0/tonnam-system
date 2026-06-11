import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/enums'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  SENT_TO_KITCHEN: {
    label: 'ອໍເດີໃຫມ່',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-800',
  },
  COOKED: {
    label: 'ສຳເລັດ',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-800',
    dotClass: 'bg-emerald-800',
  },
  CANCELLED: {
    label: 'ຍົກເລີກ',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-800',
    dotClass: 'bg-rose-800',
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const { label, bgClass, textClass, dotClass } = statusConfig[status]

  return (
    <Badge
      className={cn(
        'border-none px-2 py-0.5 text-xs font-medium',
        bgClass,
        textClass,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />
      {label}
    </Badge>
  )
}
