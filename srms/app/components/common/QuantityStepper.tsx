import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const isMd = size === 'md'

  return (
    <div className={`flex items-center ${isMd ? 'gap-7' : 'gap-2'} ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={
          isMd
            ? 'w-10 h-10 rounded-full border-2 border-ink-200 flex items-center justify-center text-ink-700 hover:bg-ink-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            : 'w-8 h-8 rounded-lg border border-ink-100 flex items-center justify-center text-ink-700 hover:bg-ink-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        }
        aria-label="ຫຼຸດ"
      >
        <Minus size={isMd ? 16 : 14} />
      </button>

      <span
        className={
          isMd
            ? 'w-8 text-center text-xl font-bold text-ink-900 tabular-nums'
            : 'w-5 text-center text-sm font-semibold text-ink-900'
        }
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
        className={
          isMd
            ? 'w-10 h-10 rounded-full bg-success text-white flex items-center justify-center hover:bg-green-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            : 'w-8 h-8 rounded-lg border border-ink-100 flex items-center justify-center text-ink-700 hover:bg-ink-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        }
        aria-label="ເພີ່ມ"
      >
        <Plus size={isMd ? 16 : 14} />
      </button>
    </div>
  )
}
