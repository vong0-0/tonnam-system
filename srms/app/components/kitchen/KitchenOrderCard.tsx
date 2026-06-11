import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CancelReasonDialog } from '@/components/common/CancelReasonDialog'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import OrderItemStatusBadge from '@/components/common/OrderItemStatusBadge'
import { Button } from '@/components/ui/button'
import { useBill } from '@/hooks/useBills'
import { useOrder, useUpdateOrderItem } from '@/hooks/useOrders'
import { cn } from '@/lib/utils'
import type { Order, OrderItem } from '@/types/entities'
import { OrderStatus } from '@/types/enums'

const orderStatusConfig: Record<OrderStatus, { style: string }> = {
  [OrderStatus.SENT_TO_KITCHEN]: { style: 'bg-amber-50 text-amber-600' },
  [OrderStatus.COOKED]: { style: 'bg-teal-50 text-teal-600' },
  [OrderStatus.CANCELLED]: { style: 'bg-rose-50 text-rose-600' },
}


function OrderItemsContent({ orderId }: { orderId: string }) {
  const { data: orderDetail, isLoading } = useOrder(orderId)
  const { mutate: updateItem, isPending: isUpdating } = useUpdateOrderItem()
  const [cancelItem, setCancelItem] = useState<OrderItem | null>(null)

  const items = orderDetail?.items ?? []
  const pendingItems = items.filter((i: OrderItem) => i.status === null)

  const handleMarkDone = (itemId: string) =>
    updateItem({ orderId, itemId, body: { status: 'COOKED' } })

  const handleConfirmCancel = (reason: string) => {
    if (!cancelItem) return
    updateItem(
      { orderId, itemId: cancelItem._id, body: { status: 'CANCELLED', reason } },
      { onSuccess: () => setCancelItem(null) },
    )
  }

  return (
    <>
      <CancelReasonDialog
        open={!!cancelItem}
        onOpenChange={(open) => { if (!open) setCancelItem(null) }}
        title="ຢືນຢັນການຍົກເລີກລາຍການ"
        description={`ທ່ານຕ້ອງການຍົກເລິກລາຍການອາຫານນີ້ແທ້ໍບໍ ?`}
        onConfirm={handleConfirmCancel}
        isPending={isUpdating}
      />

      <div className="px-5 py-4">
        {items.length === 0 ? (
          <p className="text-center font-bold text-lg text-zinc-500">ບໍ່ມີລາຍການອາຫານ</p>
        ) : (
          <div className="space-y-2 [&_>_div:last-child]:border-b-0 [&_>_div]:border-b [&_>_div]:pb-2">
            {items.map((item: OrderItem) => (
              <div key={item._id} className="flex justify-between items-start gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black">{item.name}</p>
                  <p className="text-zinc-500">ຈຳນວນ: {item.quantity}</p>
                  {item.note && <p className="text-gold">ໝາຍເຫດ: {item.note}</p>}
                </div>

                {item.status !== null ? (
                  <OrderItemStatusBadge status={item.status} />
                ) : (
                  <div className="space-x-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      className="px-4 py-2 bg-red-500 hover:bg-red-600"
                      disabled={isUpdating}
                      onClick={() => setCancelItem(item)}
                    >
                      ຍົກເລິກລາຍການ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600"
                      disabled={isUpdating}
                      onClick={() => handleMarkDone(item._id)}
                    >
                      ພ້ອມເສີບ
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingItems.length > 0 && (
        <div className="bg-zinc-100 px-3 py-4">
          <Button
            type="button"
            className="w-full h-auto py-2.5 bg-teal-500 hover:bg-teal-600"
          >
            ສົ່ງລາຍການອາຫານ
          </Button>
        </div>
      )}
    </>
  )
}

interface KitchenOrderCardProps {
  order: Order
}

export default function KitchenOrderCard({ order }: KitchenOrderCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: billDetail } = useBill(order.bill_id)
  const tableLabel = billDetail?.table?.table_name ?? '—'
  const billShortId = billDetail?.bill.short_id ?? '...'

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        className=""
        onValueChange={(v) => setIsOpen(!!v)}
      >
        <AccordionItem value={order._id} className="*:data-[slot=accordion-content]:p-0">
          <AccordionTrigger
            className={cn(
              orderStatusConfig[order.status].style,
              'data-[state=open]:rounded-br-none! data-[state=open]:rounded-bl-none! rounded-lg px-5 py-4 **:data-[slot=accordion-trigger-icon]:hidden cursor-pointer hover:no-underline hover:border-black',
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex flex-col gap-2">
                <p className="font-bold text-2xl">{tableLabel}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="space-y-1 text-zinc-500">
                <p>ອໍເດີ້ເລກທີ: {order.short_id}</p>
                <p>ບິນເລກທີ: {billShortId}</p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="h-auto bg-white [&_p:not(:last-child)]:mb-0 pb-0">
            {isOpen && <OrderItemsContent orderId={order._id} />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
