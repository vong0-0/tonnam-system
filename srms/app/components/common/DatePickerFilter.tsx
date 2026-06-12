import { useState } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { formatDateLao } from '@/lib/date'
import { cn } from '@/lib/utils'

const LAO_MONTHS = [
  'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
  'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ',
]
const LAO_WEEKDAYS = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ']

interface DatePickerFilterProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disableFuture?: boolean
  disablePast?: boolean
}

export function DatePickerFilter({
  value,
  onChange,
  placeholder = 'ເລືອກວັນທີ',
  className,
  disableFuture = true,
  disablePast = false,
}: DatePickerFilterProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full h-auto py-2 px-3 justify-start font-normal gap-1.5',
              value && 'pr-8',
            )}
          >
            <CalendarIcon size={14} className="shrink-0 text-ink-400" />
            <span className={cn('truncate text-sm', !value && 'text-ink-400')}>
              {value ? formatDateLao(value) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="[--cell-size:2.5rem]"
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); setOpen(false) }}
            disabled={
              disableFuture
                ? (date) => date > new Date()
                : disablePast
                  ? (date) => date < new Date(new Date().setHours(0, 0, 0, 0))
                  : undefined
            }
            weekStartsOn={1}
            formatters={{
              formatCaption: (date: Date) =>
                `${LAO_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`,
              formatMonthDropdown: (date: Date) => LAO_MONTHS[date.getMonth()] ?? '',
              formatWeekdayName: (date: Date) => LAO_WEEKDAYS[date.getDay()] ?? '',
            }}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 focus:outline-none"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
