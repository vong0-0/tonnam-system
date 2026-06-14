import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Role } from '@/constants/roles'

interface UserRoleBadgeProps {
  role: Role
  className?: string
}

const roleConfig: Record<Role, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  ADMIN: { label: 'ADMIN', bgClass: 'bg-danger/10', textClass: 'text-danger', dotClass: 'bg-danger' },
  CASHIER: { label: 'CASHIER', bgClass: 'bg-blue-100', textClass: 'text-blue-700', dotClass: 'bg-blue-700' },
  WAITER: { label: 'WAITER', bgClass: 'bg-green/10', textClass: 'text-green', dotClass: 'bg-green' },
  KITCHEN: { label: 'KITCHEN', bgClass: 'bg-amber-100', textClass: 'text-amber-700', dotClass: 'bg-amber-700' },
}

export default function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const { label, bgClass, textClass, dotClass } = roleConfig[role]
  return (
    <Badge className={cn('border-none px-2 py-0.5 text-xs font-medium', bgClass, textClass, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />
      {label}
    </Badge>
  )
}
