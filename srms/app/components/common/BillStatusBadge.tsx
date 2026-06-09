import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BillStatus } from '@/types/enums'

interface BillStatusBadgeProps {
  status: BillStatus
  className?: string
}

const statusConfig: Record<
  BillStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  OPEN: {
    label:     'ເປີດຢູ່',
    bgClass:   'bg-status-open-bg',
    textClass: 'text-status-open-fg',
    dotClass:  'bg-status-open-fg',
  },
  PAID: {
    label:     'ຊຳລະແລ້ວ',
    bgClass:   'bg-status-paid-bg',
    textClass: 'text-status-paid-fg',
    dotClass:  'bg-status-paid-fg',
  },
  CANCELLED: {
    label:     'ຍົກເລີກ',
    bgClass:   'bg-status-cancelled-bg',
    textClass: 'text-status-cancelled-fg',
    dotClass:  'bg-status-cancelled-fg',
  },
}

export default function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
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
