import { ServerCrash, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'ໂຫລດຂໍ້ມູນບໍ່ໄດ້',
  description = 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່ ຫຼື ຕິດຕໍ່ທີມງານ',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8', className)}>
      <div className="mb-5 w-16 h-16 rounded-2xl bg-[rgba(192,57,43,0.05)] border border-[rgba(192,57,43,0.15)] shadow-sm flex items-center justify-center">
        <ServerCrash size={28} strokeWidth={1.5} className="text-danger" />
      </div>

      <p className="text-sm font-semibold text-ink-900 text-center text-balance">
        {title}
      </p>
      <p className="mt-1.5 text-xs text-ink-500 text-center leading-relaxed max-w-[220px] text-pretty">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 transition-colors duration-150"
        >
          <RotateCcw size={13} strokeWidth={2} />
          ລອງໃໝ່
        </button>
      )}
    </div>
  )
}
