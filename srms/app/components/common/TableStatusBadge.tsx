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
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-800',
    dotClass: 'bg-teal-800',
  },
  OCCUPIED: {
    label: 'ມີລູກຄ້າ',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-800',
  },
  RESERVED: {
    label: 'ຈອງ',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    dotClass: 'bg-blue-800',
  },
  PAID: {
    label: 'ຊຳລະແລ້ວ',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-800',
    dotClass: 'bg-slate-800',
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
