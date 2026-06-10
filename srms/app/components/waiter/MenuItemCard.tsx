import { Plus, UtensilsCrossed } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import type { MenuItem } from '@/types/entities'

interface MenuItemCardProps {
  item: MenuItem
  cartQty: number
  onAdd: () => void
}

export function MenuItemCard({ item, cartQty, onAdd }: MenuItemCardProps) {
  const isUnavailable = !item.is_available || item.is_sold_out

  return (
    <div
      className={`flex items-center gap-3 bg-paper rounded-xl border shadow-sm border-ink-100 p-3 ${isUnavailable ? 'opacity-50' : ''}`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-ink-50 flex items-center justify-center shrink-0">
          <UtensilsCrossed size={20} strokeWidth={1.5} className="text-ink-200" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="text-base font-bold text-ink-900 leading-snug">{item.name}</p>
          {item.is_sold_out && (
            <span className="shrink-0 text-xs font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded-md">
              ໝົດ
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">{item.description}</p>
        )}
        <p className="text-xl text-success font-bold mt-1">{formatNumber(item.price)} ກີບ</p>
      </div>

      <button
        onClick={onAdd}
        disabled={isUnavailable}
        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150 ${
          cartQty > 0
            ? 'bg-success text-white text-xs font-bold'
            : 'border border-ink-100 text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed'
        }`}
        aria-label={`ເພີ່ມ ${item.name}`}
      >
        {cartQty > 0 ? cartQty : <Plus size={16} strokeWidth={2.5} />}
      </button>
    </div>
  )
}
