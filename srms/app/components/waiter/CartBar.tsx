import { ShoppingCart } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface CartBarProps {
  totalItems: number
  totalPrice: number
  onClick: () => void
  className?: string
}

export function CartBar({ totalItems, totalPrice, onClick, className }: CartBarProps) {
  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-10 px-4 pt-3 ${className ?? ''}`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-[500px] mx-auto">
        <button
          onClick={onClick}
          className="w-full h-14 rounded-xl bg-success hover:bg-green-light active:bg-green transition-colors duration-150 text-white flex items-center px-4 gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <ShoppingCart size={16} />
          </div>
          <span className="text-sm font-semibold flex-1 text-left">{totalItems} ລາຍການ</span>
          <span className="text-sm font-semibold">{formatNumber(totalPrice)} ກີບ</span>
        </button>
      </div>
    </div>
  )
}
