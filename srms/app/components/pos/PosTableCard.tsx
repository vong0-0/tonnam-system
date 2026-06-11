import { cn } from "@/lib/utils"
import type { Table, OrderWithItems, OrderItem } from '@/types/entities'
import { TableStatus } from "@/types"
import TableStatusBadge from "../common/TableStatusBadge"
import { Button } from "../ui/button"
import { useBill } from '@/hooks/useBills'

const tableStatusConfig: Record<TableStatus, { style: string }> = {
  [TableStatus.AVAILABLE]: { style: 'bg-teal-50 text-teal-600' },
  [TableStatus.RESERVED]: { style: 'bg-blue-50 text-blue-600' },
  [TableStatus.OCCUPIED]: { style: 'bg-amber-50 text-amber-600' },
  [TableStatus.PAID]: { style: 'bg-slate-50 text-slate-600' },
}

function mergeItems(items: OrderItem[]): OrderItem[] {
  const result: OrderItem[] = []
  const grouped = new Map<string, OrderItem>()

  for (const item of items) {
    if (item.note) {
      result.push(item)
    } else {
      const existing = grouped.get(item.menu_item_id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        const clone = { ...item }
        grouped.set(item.menu_item_id, clone)
        result.push(clone)
      }
    }
  }

  return result
}

interface PosTableCardProps {
  table: Table
}

export default function PosTableCard({ table }: PosTableCardProps) {
  const activeBillId = table.bill_ids?.at(-1) ?? ''
  const { data: billDetail } = useBill(activeBillId)

  const allItems = billDetail?.orders.flatMap((o: OrderWithItems) => o.items) ?? []
  const displayItems = mergeItems(allItems)

  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <div className={cn(tableStatusConfig[table.status].style, "px-5 py-4")}>
        <div className="flex flex-col w-full gap-2">
          <div className="w-full flex items-center justify-between gap-2">
            <p className="font-bold text-2xl">{table.table_name}</p>
            <TableStatusBadge status={table.status} />
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            {billDetail ? billDetail.bill.short_id : `${table.capacity} ທີ່ນັ່ງ`}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 bg-white h-[222px]">
        {displayItems.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-center font-bold text-xl text-zinc-500">ບໍ່ມີລາຍການອາຫານ</p>
          </div>
        ) : (
          <ul className="[&_>_li]:border-b [&_>_li:last-child]:border-none [&_>_li]:pb-2 space-y-2">
            {displayItems.slice(0, 3).map((item: OrderItem) => (
              <li key={item._id}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-meduim">{item.name}</span>
                  <span className="text-sm font-medium">x{item.quantity}</span>
                </div>
                {item.note && <p className="text-amber-600 text-sm">{item.note}</p>}
              </li>
            ))}
            {displayItems.length > 3 && (
              <li className="text-xs text-teal-500 pt-1">
                +{displayItems.length - 3} ລາຍການ
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="px-4 py-4">
        <Button className="px-4 py-3 text-lg font-bold w-full bg-teal-500 hover:bg-teal-600">
          {table.status === TableStatus.OCCUPIED ? 'ສະແດງລາຍລະອຽດ' : 'ເປີດໂຕະ'}
        </Button>
      </div>
    </div>
  )
}
