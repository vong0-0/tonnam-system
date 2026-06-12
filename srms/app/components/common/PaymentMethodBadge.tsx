import { Banknote, QrCode, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/enums'

interface PaymentMethodBadgeProps {
  method: PaymentMethod
  className?: string
}

const methodConfig: Record<
  PaymentMethod,
  { label: string; icon: React.ElementType; bgClass: string; textClass: string }
> = {
  CASH: {
    label:     'ກີບສົດ',
    icon:      Banknote,
    bgClass:   'bg-emerald-100',
    textClass: 'text-emerald-700',
  },
  QR_PROMPTPAY: {
    label:     'ໂອນຈ່າຍ',
    icon:      QrCode,
    bgClass:   'bg-violet-100',
    textClass: 'text-violet-700',
  },
  MIXED: {
    label:     'ປະສົມ',
    icon:      Shuffle,
    bgClass:   'bg-blue-100',
    textClass: 'text-blue-700',
  },
}

export default function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  const { label, icon: Icon, bgClass, textClass } = methodConfig[method]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        bgClass,
        textClass,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  )
}
