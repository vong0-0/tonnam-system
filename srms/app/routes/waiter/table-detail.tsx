import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ChevronLeft, Plus, ArrowRight, UtensilsCrossed } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
// TODO: swap to useTable(id) + useBillDetail(billId) when API is ready
import { mockTable, mockBillDetail } from '@/mocks/table.mock'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import TableStatusBadge from '@/components/common/TableStatusBadge'
import OrderItemStatusBadge from '@/components/common/OrderItemStatusBadge'
import BillSummaryCard from '@/components/waiter/BillSummaryCard'
import OrderItemList from '@/components/waiter/OrderItemList'

export default function WaiterTableDetail() {
  useParams<{ id: string }>()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const table = mockTable
  const bill = mockBillDetail

  return (
    <div className="flex flex-col pb-40">
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
        <BillSummaryCard bill={bill[0]} />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-700">ລາຍການສັ່ງ</h2>
          {bill[0].orders.length > 0 ? (
            <OrderItemList orders={bill[0].orders} />
          ) : (
            <EmptyState icon={UtensilsCrossed} title="ຍັງບໍ່ມີລາຍການ" description="ກົດ + ເພື່ອເພີ່ມລາຍການສັ່ງ" />
          )}
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-10 bg-paper border-t border-ink-100 px-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-[500px] mx-auto flex flex-col gap-2">
          <button
            onClick={() => {/* TODO: navigate to new order */}}
            className="w-full h-12 rounded-xl bg-green hover:bg-green-light active:bg-green transition-colors duration-150 text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={2.5} />
            ສັ່ງເມນູເພີ່ມ
          </button>

          <button
            onClick={() => {/* TODO: open move table dialog */}}
            className="w-full h-12 rounded-xl border border-ink-100 bg-paper hover:bg-ink-50 active:bg-ink-100 transition-colors duration-150 text-ink-700 text-sm font-medium flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} />
            ຍ້າຍໂຕະ
          </button>
        </div>
      </div>
    </div>
  )
}
