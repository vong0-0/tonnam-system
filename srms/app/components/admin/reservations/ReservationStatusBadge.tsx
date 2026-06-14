import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReservationStatus } from '@/types/enums'

const statusConfig: Record<
  ReservationStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  PENDING: {
    label: 'ລໍຖ້າ',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'ຢືນຢັນແລ້ວ',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-800',
    dotClass: 'bg-teal-600',
  },
  CANCELLED: {
    label: 'ຍົກເລີກແລ້ວ',
    bgClass: 'bg-ink-100',
    textClass: 'text-ink-500',
    dotClass: 'bg-ink-400',
  },
}

export default function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, bgClass, textClass, dotClass } = statusConfig[status]
  return (
    <Badge className={cn('border-none px-2 py-0.5 text-xs font-medium', bgClass, textClass)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />
      {label}
    </Badge>
  )
}
