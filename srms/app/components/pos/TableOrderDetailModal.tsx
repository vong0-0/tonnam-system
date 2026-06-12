import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Table,
  BillDetail,
  OrderItem,
  OrderWithItems,
} from "@/types/entities";
import { TableStatus, OrderItemStatus } from "@/types/enums";
import { Button } from "../ui/button";
import { formatNumber } from "@/lib/utils";
import {
  BetweenHorizonalStart,
  Minus,
  Plus,
  ReceiptText,
  RotateCcw,
  X,
} from "lucide-react";
import AddOrderModal from "./AddOrderModal";
import PaymentModal from "./PaymentModal";
import ReasonModal from "./ReasonModal";
import MoveTableModal from "./MoveTableModal";
import { useUpdateTableStatus } from "@/hooks/useTables";
import {
  useUpdateOrderItem,
  useUpdateOrderItemQuantity,
} from "@/hooks/useOrders";
import { useCancelBill, useCreateBill } from "@/hooks/useBills";

interface TableOrderDetailModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  table: Table;
  billDetail: BillDetail | undefined;
}

export default function TableOrderDetailModal({
  open,
  onOpenChange,
  table,
  billDetail,
}: TableOrderDetailModalProps) {
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [billCancelOpen, setBillCancelOpen] = useState(false);
  const [pendingQtys, setPendingQtys] = useState<Record<string, number>>({});
  const [reasonModal, setReasonModal] = useState<{
    type: "qty" | "cancel";
    item: OrderItem;
  } | null>(null);

  const { mutate: clearTable, isPending: isClearing } = useUpdateTableStatus();
  const { mutate: cancelItem, isPending: isCancelling } = useUpdateOrderItem();
  const { mutate: updateQty, isPending: isUpdatingQty } =
    useUpdateOrderItemQuantity();
  const { mutate: cancelBill, isPending: isCancellingBill } = useCancelBill();
  const { mutate: createBill, isPending: isCreatingBill } = useCreateBill();

  const hasBill = !!billDetail;
  const isPaid = table.status === TableStatus.PAID;
  const allItems: OrderItem[] =
    billDetail?.orders.flatMap((o: OrderWithItems) => o.items) ?? [];
  const hasActiveItems = allItems.some(
    (item) => item.status !== OrderItemStatus.CANCELLED,
  );
  const billShortId = billDetail?.bill.short_id;
  const totalAmount = billDetail?.bill.total_amount ?? 0;

  function getDisplayQty(item: OrderItem): number {
    return pendingQtys[item._id] ?? item.quantity;
  }

  function handleQtyChange(item: OrderItem, delta: number) {
    const current = getDisplayQty(item);
    const next = Math.max(1, current + delta);
    setPendingQtys((prev) => ({ ...prev, [item._id]: next }));
  }

  function handleReasonConfirm(reason: string) {
    if (!reasonModal) return;
    if (reasonModal.type === "cancel") {
      cancelItem(
        {
          orderId: reasonModal.item.order_id,
          itemId: reasonModal.item._id,
          body: { status: "CANCELLED", reason },
        },
        { onSuccess: () => setReasonModal(null) },
      );
    } else {
      const qty = getDisplayQty(reasonModal.item);
      updateQty(
        {
          orderId: reasonModal.item.order_id,
          itemId: reasonModal.item._id,
          body: { quantity: qty, reason },
        },
        {
          onSuccess: () => {
            setPendingQtys((prev) => {
              const n = { ...prev };
              delete n[reasonModal.item._id];
              return n;
            });
            setReasonModal(null);
          },
        },
      );
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[550px] w-screen flex flex-col overflow-hidden gap-0">
          <DialogHeader className="p-6">
            <DialogTitle className="font-body font-bold text-xl">
              ລາຍການອາຫານໂຕະ {table.table_name}
            </DialogTitle>
            {billShortId && (
              <p className="text-sm text-zinc-500">ເລກບິນ: {billShortId}</p>
            )}
          </DialogHeader>

          <div className="bg-white">
            {!hasBill && (
              <div className="flex flex-col gap-4 items-center justify-center h-[150px]">
                <p className="text-ink-500 underline text-xl font-bold">
                  ເປີດບິດເພື່ອສັ່ງອາຫານ
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    className="w-fit text-base font-bold bg-teal-500 hover:bg-teal-600 px-4 py-2"
                    disabled={isCreatingBill}
                    onClick={() =>
                      createBill({
                        table_id: table._id,
                        name: table.table_name,
                      })
                    }
                  >
                    {isCreatingBill ? "ກຳລັງເປີດ..." : "ເປີດບິດເພື່ອສັ່ງອາຫານ"}
                  </Button>
                  {table.status === TableStatus.OCCUPIED && (
                    <Button
                      variant="outline"
                      className="w-fit text-sm font-medium text-amber-600 border-amber-400 hover:bg-amber-50 px-4 py-2"
                      disabled={isClearing}
                      onClick={() =>
                        clearTable(
                          { id: table._id, status: "AVAILABLE" },
                          { onSuccess: () => onOpenChange(false) },
                        )
                      }
                    >
                      {isClearing ? "ກຳລັງດຳເນີນການ..." : "ຍົກເລີກການເປີດໂຕະ"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {hasBill && allItems.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <p className="text-ink-500 text-xl font-bold">
                  ບໍ່ມີລາຍການອາຫານ
                </p>
              </div>
            )}

            {hasBill && allItems.length > 0 && (
              <div className="px-6 max-h-[300px] border-b overflow-y-auto">
                <p className="font-bold text-zinc-500 text-base">ລາຍການອາຫານ</p>
                <ul className="divide-y divide-ink-100">
                  {allItems.map((item) => {
                    const isCancelled =
                      item.status === OrderItemStatus.CANCELLED;
                    const displayQty = getDisplayQty(item);
                    const qtyChanged = displayQty !== item.quantity;

                    return (
                      <li
                        key={item._id}
                        className={`py-3 space-y-1 ${isCancelled ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold text-base text-zinc-600 ${isCancelled ? "line-through" : ""}`}
                            >
                              {item.name}
                            </p>
                            {item.note && (
                              <p className="text-amber-600 text-xs mt-0.5">
                                ຫມາຍເຫດ: {item.note}
                              </p>
                            )}
                            <p className="text-xs text-zinc-500">
                              {item.quantity} x {formatNumber(item.unit_price)}{" "}
                              = {formatNumber(item.quantity * item.unit_price)}{" "}
                              ກີບ
                            </p>
                          </div>

                          {!isPaid && !isCancelled && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => handleQtyChange(item, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-bold">
                                {displayQty}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => handleQtyChange(item, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              {qtyChanged && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
                                    onClick={() =>
                                      setPendingQtys((prev) => {
                                        const n = { ...prev };
                                        delete n[item._id];
                                        return n;
                                      })
                                    }
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-xs font-bold bg-teal-500 hover:bg-teal-600"
                                    onClick={() =>
                                      setReasonModal({ type: "qty", item })
                                    }
                                  >
                                    ຢືນຢັນ
                                  </Button>
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  setReasonModal({ type: "cancel", item })
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {hasBill && (
            <div className="px-6 py-6 space-y-4">
              <div className="bg-blue-50 flex items-center justify-between p-4 rounded-lg">
                <span className="font-bold text-lg">ລວມ</span>
                <span className="font-bold text-2xl text-blue-500">
                  {formatNumber(totalAmount)} ກີບ
                </span>
              </div>
              <div className="grid grid-cols-2 auto-rows-auto gap-2">
                <Button
                  disabled={isPaid}
                  className="w-full font-bold text-lg bg-teal-500 hover:bg-teal-600 px-4 py-3"
                  onClick={() => setAddOrderOpen(true)}
                >
                  <Plus />
                  ສັ່ງອາຫານເພີ່ມ
                </Button>

                {isPaid ? (
                  <Button
                    className="w-full font-bold text-lg bg-blue-500 hover:bg-blue-600 px-4 py-3"
                    disabled={isClearing}
                    onClick={() =>
                      clearTable(
                        { id: table._id, status: "AVAILABLE" },
                        { onSuccess: () => onOpenChange(false) },
                      )
                    }
                  >
                    <ReceiptText />
                    {isClearing ? "ກຳລັງລ້າງ..." : "ລ້າງໂຕະ"}
                  </Button>
                ) : (
                  <Button
                    className="w-full font-bold text-lg bg-blue-500 hover:bg-blue-600 px-4 py-3"
                    disabled={!hasActiveItems}
                    onClick={() => setPaymentOpen(true)}
                  >
                    <ReceiptText />
                    ໄລ່ເງິນ
                  </Button>
                )}

                <Button
                  disabled={isPaid}
                  className="w-full font-bold text-lg bg-amber-500 hover:bg-amber-600 px-4 py-3"
                  onClick={() => setMoveOpen(true)}
                >
                  <BetweenHorizonalStart />
                  ຢ້າຍໂຕະ
                </Button>
                <Button
                  disabled={isPaid}
                  className="w-full font-bold text-lg bg-red-500 hover:bg-red-600 px-4 py-3"
                  onClick={() => setBillCancelOpen(true)}
                >
                  <ReceiptText />
                  ຍົກເລິກບິດ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {billDetail && (
        <AddOrderModal
          open={addOrderOpen}
          onOpenChange={setAddOrderOpen}
          billId={billDetail.bill._id}
          tableName={table.table_name}
        />
      )}

      {billDetail && (
        <PaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          billDetail={billDetail}
        />
      )}

      <ReasonModal
        open={!!reasonModal}
        onOpenChange={(v) => {
          if (!v) setReasonModal(null);
        }}
        title={reasonModal?.type === "cancel" ? "ຍົກເລີກລາຍການ" : "ປ່ຽນຈຳນວນ"}
        isPending={isCancelling || isUpdatingQty}
        onConfirm={handleReasonConfirm}
      />

      <MoveTableModal
        open={moveOpen}
        onOpenChange={setMoveOpen}
        sourceTable={table}
        onMoveSuccess={() => onOpenChange(false)}
      />

      <ReasonModal
        open={billCancelOpen}
        onOpenChange={setBillCancelOpen}
        title="ຍົກເລີກບິນ"
        description={billShortId ? `ເລກບິນ: ${billShortId}` : undefined}
        isPending={isCancellingBill}
        onConfirm={(reason) => {
          if (!billDetail) return;
          cancelBill(
            { id: billDetail.bill._id, reason },
            {
              onSuccess: () => {
                setBillCancelOpen(false);
                onOpenChange(false);
              },
            },
          );
        }}
      />
    </>
  );
}
