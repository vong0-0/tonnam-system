import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

interface TimePickerInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePickerInput({
  value,
  onChange,
  placeholder = 'ເລືອກເວລາ',
  className,
}: TimePickerInputProps) {
  const [open, setOpen] = useState(false)

  const [selectedHour, selectedMinute] = value
    ? value.split(':')
    : ['', '']

  const hourRef   = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, selected: string, items: string[]) => {
      if (!ref.current || !selected) return
      const idx = items.indexOf(selected)
      if (idx < 0) return
      const child = ref.current.children[idx] as HTMLElement | undefined
      child?.scrollIntoView({ block: 'nearest' })
    }
    const id = setTimeout(() => {
      scrollTo(hourRef,   selectedHour,   HOURS)
      scrollTo(minuteRef, selectedMinute, MINUTES)
    }, 50)
    return () => clearTimeout(id)
  }, [open, selectedHour, selectedMinute])

  function handleSelect(hour: string, minute: string) {
    const h = hour   || selectedHour   || '00'
    const m = minute || selectedMinute || '00'
    onChange(`${h}:${m}`)
  }

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full h-auto py-2 px-3 justify-start font-normal gap-1.5"
          >
            <Clock size={14} className="shrink-0 text-ink-400" />
            <span className={cn('truncate text-sm', !value && 'text-ink-400')}>
              {value || placeholder}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-40 p-2" align="start">
          <div className="flex gap-1">
            {/* Hours column */}
            <div
              ref={hourRef}
              className="flex-1 h-48 overflow-y-auto space-y-0.5 scroll-smooth"
              onWheel={(e) => e.stopPropagation()}
            >
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleSelect(h, selectedMinute || '00')}
                  className={cn(
                    'w-full rounded px-2 py-1 text-sm text-center transition-colors',
                    h === selectedHour
                      ? 'bg-green-700 text-white font-semibold'
                      : 'hover:bg-ink-50 text-ink-700',
                  )}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="w-px bg-ink-100 self-stretch" />

            {/* Minutes column */}
            <div
              ref={minuteRef}
              className="flex-1 h-48 overflow-y-auto space-y-0.5 scroll-smooth"
              onWheel={(e) => e.stopPropagation()}
            >
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    handleSelect(selectedHour || '00', m)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full rounded px-2 py-1 text-sm text-center transition-colors',
                    m === selectedMinute
                      ? 'bg-green-700 text-white font-semibold'
                      : 'hover:bg-ink-50 text-ink-700',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
