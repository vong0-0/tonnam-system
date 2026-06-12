import { type ColumnDef } from '@tanstack/react-table'
import { CheckCircle, XCircle, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReservationStatusBadge from '@/components/common/ReservationStatusBadge'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import type { Reservation } from '@/types/entities'

interface ReservationHandlers {
  onConfirm: (r: Reservation) => void
  onCancel:  (r: Reservation) => void
  onEdit:    (r: Reservation) => void
}

export function makeReservationColumns(
  tableMap: Map<string, string>,
  handlers: ReservationHandlers,
): ColumnDef<Reservation>[] {
  return [
    {
      accessorKey: 'table_id',
      header: 'ໂຕະ',
      cell: ({ row }) => (
        <span className="font-medium text-ink-900">
          {tableMap.get(row.getValue('table_id')) ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'reserver_name',
      header: 'ຊື່ຜູ້ຈອງ',
      cell: ({ row }) => (
        <span className="font-medium text-ink-900">{row.getValue('reserver_name')}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'ເບີໂທ',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-ink-700">{row.getValue('phone')}</span>
      ),
    },
    {
      accessorKey: 'party_size',
      header: () => <div className="text-right">ຄົນ</div>,
      cell: ({ row }) => (
        <div className="text-right text-ink-700">
          {row.getValue<number>('party_size')} ຄົນ
        </div>
      ),
    },
    {
      accessorKey: 'reserved_at',
      header: 'ເວລາ',
      cell: ({ row }) => (
        <span className="text-sm text-ink-600">
          {formatDate(row.getValue('reserved_at'), DATE_FORMATS.DATE_TIME)}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'ໝາຍເຫດ',
      cell: ({ row }) => {
        const notes = row.getValue<string | null>('notes')
        return notes
          ? <span className="text-sm text-ink-600 max-w-[200px] truncate block" title={notes}>{notes}</span>
          : <span className="text-ink-300">—</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'ສະຖານະ',
      cell: ({ row }) => <ReservationStatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'ການດຳເນີນການ',
      cell: ({ row }) => {
        const r = row.original
        if (r.status !== 'PENDING') return <span className="text-ink-300">—</span>
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
              onClick={() => handlers.onConfirm(r)}
              title="ຢືນຢັນ"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handlers.onCancel(r)}
              title="ຍົກເລີກ"
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-ink-200 text-ink-600 hover:bg-ink-50"
              onClick={() => handlers.onEdit(r)}
              title="ແກ້ໄຂ"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]
}
