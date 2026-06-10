import { useParams, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, DoorOpen, UtensilsCrossed, Loader } from 'lucide-react'
import { useTable, TABLE_KEYS, useUpdateTableStatus } from '@/hooks/useTables'
import { useBill, useCreateBill } from '@/hooks/useBills'
import { useTableDetailRealtime } from '@/hooks/useTableDetailRealtime'
import { EmptyState } from '@/components/common/EmptyState'
import TableStatusBadge from '@/components/common/TableStatusBadge'
import BillSummaryCard from '@/components/waiter/BillSummaryCard'
import OrderItemList from '@/components/waiter/OrderItemList'

export default function WaiterTableDetail() {
  const { id: tableId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { data: table, isLoading: isTableLoading, isError: isTableError } = useTable(tableId ?? '')
  const activeBillId = table?.bill_ids?.[0] ?? null

  useTableDetailRealtime(tableId ?? '', activeBillId)
  const { data: bill, isLoading: isBillLoading, isError: isBillError } = useBill(activeBillId ?? '')
  const { mutate: openBill, isPending: isOpeningBill } = useCreateBill()
  const { mutate: doUpdateStatus, isPending: isUpdatingStatus } = useUpdateTableStatus()

  function handleOpenTable() {
    doUpdateStatus({ id: tableId ?? '', status: 'OCCUPIED' })
  }

  function handleOpenBill() {
    openBill(
      { table_id: tableId ?? '', name: table?.table_name ?? '' },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: TABLE_KEYS.detail(tableId ?? '') })
        },
      },
    )
  }

  if (isTableLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-ink-400">
        <Loader size={20} className="animate-spin" />
      </div>
    )
  }

  if (isTableError || !table) {
    return (
      <div className="flex flex-col gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors duration-150"
          aria-label="ກັບໄປ"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm text-danger text-center mt-8">ໂຫຼດຂໍ້ມູນບໍ່ສໍາເລັດ</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-28">
      {/* Sub-header */}
      <div className="flex items-center gap-2 py-2 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors duration-150"
          aria-label="ກັບໄປ"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="w-full flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-ink-900">{table.table_name}</h1>
          <TableStatusBadge status={table.status} />
        </div>
      </div>

      <div className="border-t border-ink-100" />

      <div className='my-6 space-y-4'>
        {!activeBillId && (
          <EmptyState icon={UtensilsCrossed} title="ຍັງບໍ່ມີບິນ" description="ໂຕະນີ້ຍັງບໍ່ມີບິນທີ່ເປີດຢູ່" />
        )}

        {activeBillId && isBillLoading && (
          <div className="flex items-center justify-center h-32 text-ink-400">
            <Loader size={20} className="animate-spin" />
          </div>
        )}

        {activeBillId && isBillError && (
          <p className="text-sm text-danger text-center py-8">ໂຫຼດຂໍ້ມູນບິນບໍ່ສໍາເລັດ</p>
        )}

        {bill && (
          <>
            <BillSummaryCard bill={bill} />
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-ink-700">ລາຍການສັ່ງ</h2>
              {bill.orders.length > 0 ? (
                <OrderItemList orders={bill.orders} />
              ) : (
                <EmptyState icon={UtensilsCrossed} title="ຍັງບໍ່ມີລາຍການ" description="ກົດ + ເພື່ອເພີ່ມລາຍການສັ່ງ" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-10 bg-paper border-t border-ink-100 px-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-[500px] mx-auto flex flex-col gap-2">
          {table.status === 'AVAILABLE' ? (
            <button
              onClick={handleOpenTable}
              disabled={isUpdatingStatus}
              className="w-full h-12 rounded-xl bg-success hover:bg-green-light active:bg-green transition-colors duration-150 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUpdatingStatus ? (
                <><Loader size={16} className="animate-spin" />ກຳລັງເປີດໂຕະ...</>
              ) : (
                <><DoorOpen size={16} />ເປີດໂຕະ</>
              )}
            </button>
          ) : !activeBillId ? (
            <button
              onClick={handleOpenBill}
              disabled={isOpeningBill}
              className="w-full h-12 rounded-xl bg-success hover:bg-green-light active:bg-green transition-colors duration-150 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isOpeningBill ? (
                <><Loader size={16} className="animate-spin" />ກຳລັງເປີດບິນ...</>
              ) : (
                <><Plus size={16} strokeWidth={2.5} />ເປີດບິນ</>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate(`/waiter/tables/${tableId}/orders/new`)}
              className="w-full h-12 rounded-xl bg-success hover:bg-green-light active:bg-green transition-colors duration-150 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={2.5} />
              ສັ່ງເມນູເພີ່ມ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
