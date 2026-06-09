import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TableStatus } from '@/types/enums'

interface TableStatusBadgeProps {
  status: TableStatus
  className?: string
}

const statusConfig: Record<
  TableStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  AVAILABLE: {
    label: 'ວ່າງ',
    bgClass: 'bg-status-available-bg',
    textClass: 'text-status-available-fg',
    dotClass: 'bg-status-available-fg',
  },
  OCCUPIED: {
    label: 'ມີລູກຄ້າ',
    bgClass: 'bg-status-occupied-bg',
    textClass: 'text-status-occupied-fg',
    dotClass: 'bg-status-occupied-fg',
  },
  RESERVED: {
    label: 'ຈອງ',
    bgClass: 'bg-status-reserved-bg',
    textClass: 'text-status-reserved-fg',
    dotClass: 'bg-warning',
  },
  PAID: {
    label: 'ຊຳລະແລ້ວ',
    bgClass: 'bg-status-paid-bg',
    textClass: 'text-status-paid-fg',
    dotClass: 'bg-status-paid-fg',
  },
}

export default function TableStatusBadge({ status, className }: TableStatusBadgeProps) {
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
