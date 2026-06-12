import { useState, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { DatePickerFilter } from '@/components/common/DatePickerFilter'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/admin/DataTable'
import { makeReservationColumns } from '@/components/pos/reservation-columns'
import ReservationFormModal from '@/components/pos/ReservationFormModal'
import { useReservationsPage, useUpdateReservationStatus } from '@/hooks/useReservations'
import { useTables } from '@/hooks/useTables'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import type { ReservationStatus } from '@/types/enums'
import type { Reservation } from '@/types/entities'

const statusOptions: SelectOption[] = [
  { value: 'ALL',       label: 'ທຸກສະຖານະ' },
  { value: 'PENDING',   label: 'ລໍຖ້າ' },
  { value: 'CONFIRMED', label: 'ຢືນຢັນແລ້ວ' },
  { value: 'CANCELLED', label: 'ຍົກເລີກ' },
]

const LIMIT = 20

export default function PosReservations() {
  const [page, setPage]     = useState(1)
  const [status, setStatus] = useState<ReservationStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [date, setDate]     = useState<Date | undefined>(undefined)
  const [debouncedSearch]   = useDebounce(search, 300)

  const [formOpen, setFormOpen]           = useState(false)
  const [editTarget, setEditTarget]       = useState<Reservation | undefined>(undefined)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'confirm' | 'cancel'
    reservation: Reservation
  } | null>(null)

  const { data, isLoading } = useReservationsPage({
    page,
    limit: LIMIT,
    status,
    search: debouncedSearch || undefined,
    date:   date ? formatDate(date, DATE_FORMATS.DATE_ISO) : undefined,
  })

  const { tables } = useTables({ limit: 200 })
  const tableMap = useMemo(
    () => new Map(tables.map((t) => [t._id, t.table_name])),
    [tables],
  )

  const { mutate: updateStatus } = useUpdateReservationStatus()

  const reservations: Reservation[] = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1
  const total      = data?.pagination.total ?? 0

  function handleStatusChange(v: string) {
    setStatus(v as ReservationStatus | 'ALL')
    setPage(1)
  }

  function handleSearchChange(v: string) {
    setSearch(v)
    setPage(1)
  }

  function handleDateChange(d: Date | undefined) {
    setDate(d)
    setPage(1)
  }

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(r: Reservation) {
    setEditTarget(r)
    setFormOpen(true)
  }

  function handleConfirmAction() {
    if (!confirmAction) return
    updateStatus(
      {
        id:     confirmAction.reservation._id,
        status: confirmAction.type === 'confirm' ? 'CONFIRMED' : 'CANCELLED',
      },
      { onSuccess: () => setConfirmAction(null) },
    )
  }

  const columns = useMemo(
    () =>
      makeReservationColumns(tableMap, {
        onConfirm: (r) => setConfirmAction({ type: 'confirm', reservation: r }),
        onCancel:  (r) => setConfirmAction({ type: 'cancel',  reservation: r }),
        onEdit:    (r) => openEdit(r),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tableMap],
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">ການຈອງໂຕະ</h1>
          <p className="text-sm text-ink-500 mt-0.5">{total > 0 ? `${total} ລາຍການ` : ''}</p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-1.5 bg-green-700 hover:bg-green-800 h-9 px-4"
        >
          <Plus className="h-4 w-4" />
          ສ້າງການຈອງ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <SearchInput
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange('')}
          placeholder="ຄົ້ນຫາຊື່ຜູ້ຈອງ..."
          className="w-56 [&_input]:border-ink-300 [&_input]:bg-paper"
        />
        <AppSelect
          options={statusOptions}
          value={status}
          onValueChange={handleStatusChange}
          placeholder="ທຸກສະຖານະ"
          triggerClassName="w-40 h-9 border-ink-300 bg-paper"
        />
        <DatePickerFilter
          value={date}
          onChange={handleDateChange}
          placeholder="ເລືອກວັນທີ"
          className="w-44 [&_button]:bg-paper"
        />
        {date && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDateChange(undefined)}
            className="h-9 text-ink-500 hover:text-ink-900"
          >
            ລ້າງ
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={reservations} isLoading={isLoading} />

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            ສະແດງ {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} ຈາກ {total} ລາຍການ
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form modal */}
      <ReservationFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        reservation={editTarget}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => { if (!v) setConfirmAction(null) }}
        title={confirmAction?.type === 'confirm' ? 'ຢືນຢັນການຈອງ' : 'ຍົກເລີກການຈອງ'}
        description={
          confirmAction?.type === 'confirm'
            ? `ຢືນຢັນການຈອງຂອງ "${confirmAction?.reservation.reserver_name}" ແລະ ຈະປ່ຽນສະຖານະໂຕະເປັນ ຖືກໃຊ້ງານ`
            : `ຍົກເລີກການຈອງຂອງ "${confirmAction?.reservation.reserver_name}" ແລະ ຈະຄືນໂຕະໃຫ້ວ່າງ`
        }
        confirmLabel={confirmAction?.type === 'confirm' ? 'ຢືນຢັນ' : 'ຍົກເລີກການຈອງ'}
        variant={confirmAction?.type === 'cancel' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}
