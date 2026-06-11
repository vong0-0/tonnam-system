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
    label:     'ລໍຖ້າ',
    bgClass:   'bg-gold-pale',
    textClass: 'text-gold-dark',
    dotClass:  'bg-gold-dark',
  },
  COOKED: {
    label:     'ສຳເລັດ',
    bgClass:   'bg-green-pale',
    textClass: 'text-green',
    dotClass:  'bg-green',
  },
  CANCELLED: {
    label:     'ຍົກເລີກ',
    bgClass:   'bg-status-cancelled-bg',
    textClass: 'text-status-cancelled-fg',
    dotClass:  'bg-status-cancelled-fg',
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
