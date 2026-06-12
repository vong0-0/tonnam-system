import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Table } from '@/types/entities'
import { TableStatus } from '@/types/enums'
import { useTables, useMoveTable } from '@/hooks/useTables'
import TableStatusBadge from '@/components/common/TableStatusBadge'
import { cn } from '@/lib/utils'

interface MoveTableModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  sourceTable: Table
  onMoveSuccess?: () => void
}

export default function MoveTableModal({ open, onOpenChange, sourceTable, onMoveSuccess }: MoveTableModalProps) {
  const { tables } = useTables()
  const { mutate: moveTable, isPending, variables } = useMoveTable()

  const targetTables = tables.filter(
    (t) => t._id !== sourceTable._id && t.status !== TableStatus.OCCUPIED && t.status !== TableStatus.PAID,
  )

  function handleSelect(target: Table) {
    if (isPending) return
    moveTable(
      { sourceId: sourceTable._id, targetTableId: target._id },
      {
        onSuccess: () => {
          onOpenChange(false)
          onMoveSuccess?.()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] w-screen">
        <DialogHeader className='p-6'>
          <DialogTitle className="text-xl font-bold font-body">ຢ້າຍໂຕະ {sourceTable.table_name}</DialogTitle>
          <p className="text-sm text-zinc-500">ເລືອກໂຕະທີ່ຕ້ອງການຢ້າຍໄປ</p>
        </DialogHeader>

        {targetTables.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-zinc-500 text-xl font-bold">ບໍ່ມີໂຕະທີ່ສາມາດຍ້າຍໄດ້</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto px-6 pb-6">
            {targetTables.map((t) => {
              const isLoading = isPending && variables?.targetTableId === t._id
              return (
                <button
                  key={t._id}
                  disabled={isPending}
                  onClick={() => handleSelect(t)}
                  className={cn(
                    'bg-zinc-50 rounded-lg border-2 p-3 text-left transition-opacity',
                    isPending ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer',
                  )}
                >
                  <p className="font-bold text-lg">{t.table_name}</p>
                  <TableStatusBadge status={t.status} />
                  {isLoading && <p className="text-xs mt-1 font-bold">ກຳລັງຍ້າຍ...</p>}
                </button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
