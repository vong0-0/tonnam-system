import { useState, useEffect } from 'react'
import {
  format, formatDistanceToNow, isValid, isSameDay, parseISO,
  subDays, subWeeks, subMonths, subYears,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
} from 'date-fns'
import type { AnalyticsPeriod } from '@/types/analytics'

export const DATE_FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATE_SHORT: 'd/M/yyyy',
  DATE_TIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  DATE_ISO: 'yyyy-MM-dd',
  DATE_TIME_ISO: 'yyyy-MM-dd HH:mm',
  DATE_TIME_ISO_WITH_SECONDS: 'yyyy-MM-dd HH:mm:ss',
} as const

export type DateFormat = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS]

function toDate(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) throw new Error(`Invalid date: ${String(date)}`)
  return d
}

export function formatDate(
  date: Date | string,
  fmt: string = DATE_FORMATS.DATE
): string {
  return format(toDate(date), fmt)
}

export function isToday(date: Date | string): boolean {
  return isSameDay(toDate(date), new Date())
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true })
}

const LAO_MONTHS = [
  'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ',
  'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ',
  'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ',
] as const

export function formatDateLao(date: Date | string | undefined | null): string {
  if (date == null) return '—'
  try {
    const d = toDate(date)
    const day = d.getDate()
    const month = LAO_MONTHS[d.getMonth()]
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return '—'
  }
}

export function getPreviousPeriodDate(period: AnalyticsPeriod, dateStr: string): string {
  const d = toDate(dateStr)
  switch (period) {
    case 'daily':   return format(subDays(d, 1), DATE_FORMATS.DATE_ISO)
    case 'weekly':  return format(subWeeks(d, 1), DATE_FORMATS.DATE_ISO)
    case 'monthly': return format(subMonths(d, 1), DATE_FORMATS.DATE_ISO)
    case 'yearly':  return format(subYears(d, 1), DATE_FORMATS.DATE_ISO)
  }
}

export function getPeriodRange(
  period: AnalyticsPeriod,
  dateStr: string
): { start: Date; end: Date } {
  const d = toDate(dateStr)
  switch (period) {
    case 'daily':
      return { start: d, end: d }
    case 'weekly':
      return {
        start: startOfWeek(d, { weekStartsOn: 1 }),
        end:   endOfWeek(d,   { weekStartsOn: 1 }),
      }
    case 'monthly':
      return { start: startOfMonth(d), end: endOfMonth(d) }
    case 'yearly':
      return { start: startOfYear(d),  end: endOfYear(d) }
  }
}

export function useLiveClock(
  fmt: string = DATE_FORMATS.TIME_WITH_SECONDS
): string {
  const [time, setTime] = useState(() => formatDate(new Date(), fmt))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatDate(new Date(), fmt))
    }, 1_000)
    return () => clearInterval(id)
  }, [fmt])

  return time
}
