import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROLES, type Role } from '@/constants/roles'

interface RoleBadgeProps {
  role: Role
  className?: string
}

const roleConfig: Record<Role, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    bgClass: 'bg-gold-pale',
    textClass: 'text-gold-dark',
    dotClass: 'bg-gold-dark',
  },
  [ROLES.CASHIER]: {
    label: 'Cashier',
    bgClass: 'bg-green-pale',
    textClass: 'text-green',
    dotClass: 'bg-green',
  },
  [ROLES.WAITER]: {
    label: 'Waiter',
    bgClass: 'bg-status-available-bg',
    textClass: 'text-status-available-fg',
    dotClass: 'bg-status-available-fg',
  },
  [ROLES.KITCHEN]: {
    label: 'Kitchen',
    bgClass: 'bg-terra-pale',
    textClass: 'text-terra-dark',
    dotClass: 'bg-terra-dark',
  },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const { label, bgClass, textClass, dotClass } = roleConfig[role]

  return (
    <Badge
      className={cn(
        'border-none px-2 py-0.5 text-xs font-medium font-mono',
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
