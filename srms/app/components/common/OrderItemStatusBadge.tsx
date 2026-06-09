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
    label:     'ກຳລັງເຮັດ',
    bgClass:   'bg-[rgba(245,166,35,0.10)]',
    textClass: 'text-[#B37D00]',
    dotClass:  'bg-[#B37D00]',
  },
  COOKED: {
    label:     'ເຮັດສຳເລັດ',
    bgClass:   'bg-[rgba(15,155,142,0.08)]',
    textClass: 'text-[#0F9B8E]',
    dotClass:  'bg-[#0F9B8E]',
  },
  CANCELLED: {
    label:     'ຍົກເລີກ',
    bgClass:   'bg-[rgba(192,57,43,0.08)]',
    textClass: 'text-[#C0392B]',
    dotClass:  'bg-[#C0392B]',
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
