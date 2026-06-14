import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserStatusBadgeProps {
  isActive: boolean
  className?: string
}

export default function UserStatusBadge({ isActive, className }: UserStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-none px-2 py-0.5 text-xs font-medium',
        isActive ? 'bg-teal-100 text-teal-800' : 'bg-ink-100 text-ink-500',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', isActive ? 'bg-teal-800' : 'bg-ink-400')} />
      {isActive ? 'ໃຊ້ງານຢູ່' : 'ຖືກປິດ'}
    </Badge>
  )
}
