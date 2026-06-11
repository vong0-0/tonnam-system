import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderItemStatus } from '@/types/enums'

interface OrderItemStatusBadgeProps {
  status: OrderItemStatus | null
  className?: string
}

type StatusKey = 'PENDING' | 'COOKED' | 'CANCELLED'

const statusConfig: Record<StatusKey, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  PENDING: {
    label: 'ກຳລັງເຮັດ',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-800',
  },
  COOKED: {
    label: 'ເຮັດສຳເລັດ',
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

export default function OrderItemStatusBadge({ status, className }: OrderItemStatusBadgeProps) {
  const key: StatusKey = status === null ? 'PENDING' : status
  const { label, bgClass, textClass, dotClass } = statusConfig[key]

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
