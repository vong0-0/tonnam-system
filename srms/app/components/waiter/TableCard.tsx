import TableStatusBadge from '@/components/common/TableStatusBadge'
import { cn } from '@/lib/utils'
import type { TableStatus } from '@/types/enums'
import type { Table } from '@/types/entities'

interface TableCardProps {
  table: Table
  onClick?: (table: Table) => void
  className?: string
}

const statusCardConfig: Record<TableStatus, { bg: string; border: string }> = {
  AVAILABLE: {
    bg: 'bg-[rgba(15,155,142,0.05)]',
    border: 'border-[rgba(15,155,142,0.20)]',
  },
  OCCUPIED: {
    bg: 'bg-[rgba(27,67,50,0.06)]',
    border: 'border-[rgba(27,67,50,0.28)]',
  },
  RESERVED: {
    bg: 'bg-[rgba(245,166,35,0.06)]',
    border: 'border-[rgba(245,166,35,0.28)]',
  },
  PAID: {
    bg: 'bg-[rgba(45,106,79,0.06)]',
    border: 'border-[rgba(45,106,79,0.22)]',
  },
}

export default function TableCard({ table, onClick, className }: TableCardProps) {
  const { bg, border } = statusCardConfig[table.status]

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(table)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(table)}
      className={cn(
        'group flex items-center justify-between rounded-lg border px-4 py-3',
        'transition-[box-shadow,transform] duration-150 ease-out',
        bg,
        border,
        onClick && 'cursor-pointer hover:shadow-md active:scale-[0.99]',
        className,
      )}
    >
      <div className={cn(
        'flex flex-col gap-0.5 transition-transform duration-150 ease-out',
        onClick && 'group-hover:translate-x-1',
      )}>
        <span className="text-sm font-semibold text-ink-900">{table.table_name}</span>
        <span className="text-xs text-ink-500">
          {table.capacity} ທີ່ນັ່ງ{table.is_temporary ? ' · ຊົ່ວຄາວ' : ''}
        </span>
      </div>

      <div className={cn(
        'transition-transform duration-150 ease-out',
        onClick && 'group-hover:translate-x-1',
      )}>
        <TableStatusBadge status={table.status} />
      </div>
    </div>
  )
}
