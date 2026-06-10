import { X } from 'lucide-react'
import { QuantityStepper } from '@/components/common/QuantityStepper'
import { formatNumber } from '@/lib/utils'
import type { CartEntry } from '@/types/entities'

interface CartEntryRowProps {
  entry: CartEntry
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
}

export function CartEntryRow({ entry, onUpdateQty, onRemove }: CartEntryRowProps) {
  return (
    <div className="flex flex-col items-start gap-3 py-3 border-b border-ink-100 last:border-0">
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold truncate">{entry.item.name}</p>
          <button
            onClick={() => onRemove(entry.id)}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-ink-400 hover:text-danger transition-colors"
            aria-label="ລົບອອກ"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-sm text-success font-semibold mt-0.5">
          {formatNumber(entry.item.price)} × {entry.quantity} ={' '}
          {formatNumber(entry.item.price * entry.quantity)} ກີບ
        </p>
        {entry.note && (
          <p className="text-xs text-ink-500 mt-0.5 italic">ໝາຍເຫດ: {entry.note}</p>
        )}
      </div>

      <QuantityStepper
        size="sm"
        value={entry.quantity}
        min={1}
        onChange={(qty) => onUpdateQty(entry.id, qty)}
      />
    </div>
  )
}
