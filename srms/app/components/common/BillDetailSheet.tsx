import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Printer } from "lucide-react";
import BillStatusBadge from "@/components/common/BillStatusBadge";
import OrderItemStatusBadge from "@/components/common/OrderItemStatusBadge";
import PaymentMethodBadge from "@/components/common/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import { useBill } from "@/hooks/useBills";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import { printBill } from "@/lib/print-bill";
import type { OrderWithItems, OrderItem, Payment } from "@/types/entities";
import type { PaymentMethod } from "@/types/enums";

function mergeItems(items: OrderItem[]): OrderItem[] {
  const result: OrderItem[] = [];
  const grouped = new Map<string, OrderItem>();

  for (const item of items) {
    if (item.note) {
      result.push(item);
    } else {
      const existing = grouped.get(item.menu_item_id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        const clone = { ...item };
        grouped.set(item.menu_item_id, clone);
        result.push(clone);
      }
    }
  }

  return result;
}

interface BillDetailSheetProps {
  billId: string | null;
  onClose: () => void;
}

export default function BillDetailSheet({
  billId,
  onClose,
}: BillDetailSheetProps) {
  const { data: billDetail, isLoading } = useBill(billId ?? "");

  return (
    <Sheet open={billId !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] flex flex-col p-0 gap-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <SheetTitle className="font-body font-bold text-lg text-ink-900">
              {billDetail ? billDetail.bill.short_id : "ລາຍລະອຽດບິນ"}
            </SheetTitle>
            {billDetail && <BillStatusBadge status={billDetail.bill.status} />}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !billDetail ? null : (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Info grid */}
              <div className="px-6 py-4 border-b space-y-3">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  ຂໍ້ມູນທົ່ວໄປ
                </p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <span className="text-ink-500">ໂຕະ</span>
                  <span className="font-medium text-ink-900">
                    {billDetail.table?.table_name ?? billDetail.bill.name}
                  </span>

                  <span className="text-ink-500">ເວລາເປີດ</span>
                  <span className="text-ink-900">
                    {formatDate(
                      billDetail.bill.created_at,
                      DATE_FORMATS.DATE_TIME,
                    )}
                  </span>

                  <span className="text-ink-500">ອັບເດດລ່າສຸດ</span>
                  <span className="text-ink-900">
                    {formatDate(
                      billDetail.bill.updated_at,
                      DATE_FORMATS.DATE_TIME,
                    )}
                  </span>

                  <span className="text-ink-500">ສ້າງໂດຍ</span>
                  <span className="text-ink-900">
                    {billDetail.created_by_name}
                  </span>

                  <span className="text-ink-500">ຍອດລວມ</span>
                  <span className="font-bold text-teal-600">
                    {formatNumber(billDetail.bill.total_amount)} ກີບ
                  </span>
                </div>

                {billDetail.bill.cancel_reason && (
                  <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    <span className="font-semibold">ເຫດຜົນຍົກເລີກ: </span>
                    {billDetail.bill.cancel_reason}
                  </div>
                )}
              </div>

              {/* Payment section */}
              {billDetail.payments.length > 0 && (
                <div className="px-6 py-4 border-b space-y-3">
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    ການຊຳລະເງິນ
                  </p>
                  {billDetail.payments.map((payment: Payment) => {
                    const cashDetail = payment.cash ?? payment.qr_promptpay
                    return (
                      <div key={payment._id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm pl-1">
                          <span className="text-ink-500">ວິທີຊຳລະ</span>
                          <PaymentMethodBadge
                            method={payment.method as PaymentMethod}
                          />
                        </div>
                        {cashDetail && cashDetail.received_amount > 0 && (
                          <div className="grid grid-cols-2 gap-y-1 text-sm pl-1">
                            <span className="text-ink-500">ເງິນທີ່ຮັບ</span>
                            <span className="text-right text-ink-900">
                              {formatNumber(cashDetail.received_amount)} ກີບ
                            </span>
                            <span className="text-ink-500">ເງິນທອນ</span>
                            <span className="text-right font-medium text-success">
                              {formatNumber(cashDetail.change_amount)} ກີບ
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Orders section — flat merged list */}
              {billDetail.orders.length > 0 &&
                (() => {
                  const merged = mergeItems(
                    billDetail.orders.flatMap((o: OrderWithItems) => o.items),
                  );
                  return (
                    <div className="px-6 py-4 space-y-2">
                      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                        ລາຍການອາຫານ
                      </p>
                      <ul className="divide-y divide-ink-100 overflow-y-auto max-h-[400px]">
                        {merged.map((item: OrderItem) => (
                          <li
                            key={item._id}
                            className={`py-3 space-y-0.5 ${item.status === "CANCELLED" ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-bold text-base text-ink-900 ${item.status === "CANCELLED" ? "line-through" : ""}`}
                                >
                                  {item.name}
                                </p>
                                {item.note && (
                                  <p className="text-xs text-amber-600 mt-0.5">
                                    ຫມາຍເຫດ: {item.note}
                                  </p>
                                )}
                                <p className="text-xs text-ink-500">
                                  {item.quantity} x{" "}
                                  {formatNumber(item.unit_price)} ={" "}
                                  {formatNumber(
                                    item.quantity * item.unit_price,
                                  )}{" "}
                                  ກີບ
                                </p>
                              </div>
                              <OrderItemStatusBadge status={item.status} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

              {billDetail.orders.length === 0 && (
                <div className="px-6 py-8 text-center text-ink-400 text-sm">
                  ບໍ່ມີລາຍການອາຫານ
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t shrink-0">
              <Button
                className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-4 text-lg font-bold"
                onClick={() =>
                  printBill(billDetail, billDetail.created_by_name)
                }
              >
                <Printer className="h-4 w-4" />
                ພິມບິນ
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
