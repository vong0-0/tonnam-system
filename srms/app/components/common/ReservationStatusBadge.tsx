import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReservationStatus } from '@/types/enums'

interface ReservationStatusBadgeProps {
  status: ReservationStatus
  className?: string
}

const statusConfig: Record<
  ReservationStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  PENDING: {
    label:     'ລໍຖ້າ',
    bgClass:   'bg-amber-100',
    textClass: 'text-amber-800',
    dotClass:  'bg-amber-800',
  },
  CONFIRMED: {
    label:     'ຢືນຢັນແລ້ວ',
    bgClass:   'bg-green-100',
    textClass: 'text-green-800',
    dotClass:  'bg-green-800',
  },
  CANCELLED: {
    label:     'ຍົກເລີກ',
    bgClass:   'bg-red-100',
    textClass: 'text-red-800',
    dotClass:  'bg-red-800',
  },
}

export default function ReservationStatusBadge({
  status,
  className,
}: ReservationStatusBadgeProps) {
  const { label, bgClass, textClass, dotClass } = statusConfig[status]
  return (
    <Badge
      className={cn('border-none px-2 py-0.5 text-xs font-medium', bgClass, textClass, className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />
      {label}
    </Badge>
  )
}
