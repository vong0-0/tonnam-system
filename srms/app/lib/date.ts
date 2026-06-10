import { useState, useEffect } from 'react'
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

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
    const year = d.getFullYear() + 543
    return `${day} ${month} ${year}`
  } catch {
    return '—'
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
