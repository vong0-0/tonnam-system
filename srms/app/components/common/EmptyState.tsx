import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8', className)}>
      <div className="mb-5 w-16 h-16 rounded-2xl bg-ink-50 border border-ink-100 shadow-sm flex items-center justify-center">
        <Icon size={28} strokeWidth={1.5} className="text-ink-300" />
      </div>

      <p className="text-sm font-semibold text-ink-900 text-center text-balance">
        {title}
      </p>
      <p className="mt-1.5 text-xs text-ink-500 text-center leading-relaxed max-w-[220px] text-pretty">
        {description}
      </p>

      {action && (
        <div className="mt-5 flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  )
}
