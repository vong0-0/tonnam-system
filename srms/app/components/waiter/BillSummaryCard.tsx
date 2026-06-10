import { formatNumber } from '@/lib/utils'
import { countBillItemQuantity } from '@/lib/bill'
import { DATE_FORMATS, formatDate } from '@/lib/date'
import { Card, CardContent } from '@/components/ui/card'
import type { BillDetail } from '@/types/entities'

interface BillSummaryCardProps {
  bill: BillDetail
}

export default function BillSummaryCard({ bill }: BillSummaryCardProps) {
  return (
    <Card className='shadow-md'>
      <CardContent>
        <div>
          <div className='w-full flex items-center justify-between gap-2'>
            <span className='text-sm text-zinc-500'>ລະຫັດໃບບິນ</span>
            <span className='text-sm text-zinc-500'>ຍອດລວມທັ້ງຫມົດ</span>
          </div>

          <div className='w-full flex items-center justify-between gap-2'>
            <span className='text-xl font-bold text-zinc-900'>{bill.bill.short_id || '-'}</span>
            <span className='text-[22px] font-bold text-status-available-fg'>{formatNumber(bill.bill.total_amount) || 0} ກີບ</span>
          </div>
        </div>

        <div className='w-full flex items-center justify-between gap-2 pt-3 mt-5 border-t border-zinc-200'>
          <div className='text-sm text-zinc-500'>{countBillItemQuantity(bill.orders || [])} ລາຍການ</div>
          <div className='text-sm text-zinc-500'>ເປີດບິນເມື່ອ: {bill.bill.created_at ? formatDate(bill.bill.created_at, DATE_FORMATS.TIME) : '-'} ໂມງ</div>
        </div>
      </CardContent>
    </Card>
  )
}
