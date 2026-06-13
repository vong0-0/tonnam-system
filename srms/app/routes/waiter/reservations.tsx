import { useState } from 'react'
import { CalendarDays, Users, Phone, Clock, CalendarCheck } from 'lucide-react'
import { DatePickerFilter } from '@/components/common/DatePickerFilter'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import ReservationStatusBadge from '@/components/common/ReservationStatusBadge'
import { useReservationsPage, useUpdateReservationStatus } from '@/hooks/useReservations'
import { useReservationsRealtime } from '@/hooks/useReservationsRealtime'
import { useTables } from '@/hooks/useTables'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import type { ReservationStatus } from '@/types/enums'
import type { Reservation } from '@/types/entities'

const statusOptions: SelectOption[] = [
  { value: 'ALL', label: 'ທຸກສະຖານະ' },
  { value: 'PENDING', label: 'ລໍຖ້າ' },
  { value: 'CONFIRMED', label: 'ຢືນຢັນແລ້ວ' },
  { value: 'CANCELLED', label: 'ຍົກເລີກ' },
]

export default function WaiterReservations() {
  useReservationsRealtime()

  const [status, setStatus] = useState<ReservationStatus | 'ALL'>('ALL')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [confirmTarget, setConfirmTarget] = useState<Reservation | null>(null)

  const { data, isLoading } = useReservationsPage({
    status,
    date: date ? formatDate(date, DATE_FORMATS.DATE_ISO) : undefined,
    limit: 100,
  })

  const { tables } = useTables({ limit: 200 })
  const tableMap = new Map(tables.map((t) => [t._id, t.table_name]))

  const { mutate: updateStatus, isPending } = useUpdateReservationStatus()

  const reservations: Reservation[] = data?.data ?? []

  function handleConfirm() {
    if (!confirmTarget) return
    updateStatus(
      { id: confirmTarget._id, status: 'CONFIRMED' },
      { onSuccess: () => setConfirmTarget(null) },
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-8">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <DatePickerFilter
          value={date}
          onChange={setDate}
          placeholder="ເລືອກວັນທີ"
          className="flex-1 min-w-0 [&_button]:bg-paper [&_button]:border-ink-200"
        />
        <AppSelect
          options={statusOptions}
          value={status}
          onValueChange={(v) => setStatus(v as ReservationStatus | 'ALL')}
          placeholder="ທຸກສະຖານະ"
          triggerClassName="w-36 h-9 border-ink-200 bg-paper"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="ບໍ່ມີການຈອງ"
          description="ບໍ່ພົບການຈອງໂຕະໃນວັນທີ່ເລືອກ"
        />
      ) : (
        <ul className="space-y-3">
          {reservations.map((r) => (
            <li key={r._id} className="bg-paper rounded-xl border border-ink-100 shadow-sm overflow-hidden">
              {/* Top row */}
              <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="min-w-0">
                  <p className="font-bold text-base text-ink-900 truncate">{r.reserver_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-ink-500">
                    <Phone size={11} />
                    <span>{r.phone}</span>
                  </div>
                </div>
                <ReservationStatusBadge status={r.status} />
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-3 gap-2 px-4 pb-3 text-xs text-ink-600">
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-400 flex items-center gap-1"><CalendarDays size={11} /> ວັນ-ເວລາ</span>
                  <span className="font-medium">{formatDate(r.reserved_at, DATE_FORMATS.DATE_TIME)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-400 flex items-center gap-1"><Users size={11} /> ຈຳນວນ</span>
                  <span className="font-medium">{r.party_size} ທ່ານ</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-400 flex items-center gap-1"><Clock size={11} /> ໂຕະ</span>
                  <span className="font-medium">{tableMap.get(r.table_id) ?? '—'}</span>
                </div>
              </div>

              {r.notes && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-2 py-1.5">{r.notes}</p>
                </div>
              )}

              {/* Confirm button — PENDING only */}
              {r.status === 'PENDING' && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setConfirmTarget(r)}
                    className="w-full py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-green-light transition-colors"
                  >
                    ຢືນຢັນລູກຄ້າມາຮອດ
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(v) => { if (!v) setConfirmTarget(null) }}
        title="ຢືນຢັນການຈອງ"
        description={`ຢືນຢັນວ່າ "${confirmTarget?.reserver_name}" ມາຮອດແລ້ວ ໂຕະຈະຖືກປ່ຽນເປັນ ຖືກໃຊ້ງານ`}
        confirmLabel={isPending ? 'ກຳລັງດຳເນີນການ...' : 'ຢືນຢັນ'}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
