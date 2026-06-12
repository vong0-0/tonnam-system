import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BillDetail } from "@/types/entities";
import { PaymentMethod } from "@/types/enums";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "@/schemas/payment.schema";
import { useCreatePayment } from "@/hooks/usePayments";
import { cn, formatNumber } from "@/lib/utils";
import type { CreatePaymentInput } from "@/services/payment.service";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  billDetail: BillDetail;
}

const METHOD_TABS = [
  { value: PaymentMethod.CASH, label: "ເງິນສົດ" },
  { value: PaymentMethod.QR_PROMPTPAY, label: "QR" },
  { value: PaymentMethod.MIXED, label: "ເງິນສົດ + QR" },
] as const;

export default function PaymentModal({
  open,
  onOpenChange,
  billDetail,
}: PaymentModalProps) {
  const totalAmount = billDetail.bill.total_amount;
  const billId = billDetail.bill._id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useZodForm(paymentFormSchema, {
    defaultValues: { method: "CASH", cash_received: 0, qr_received: 0 },
  });

  const { mutate, isPending } = useCreatePayment();

  const method = watch("method");
  const cashReceived = Number(watch("cash_received")) || 0;
  const qrReceived = Number(watch("qr_received")) || 0;
  const changeAmount =
    method === PaymentMethod.CASH ? Math.max(0, cashReceived - totalAmount) : 0;

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit: SubmitHandler<PaymentFormValues> = (values) => {
    let body: CreatePaymentInput;

    if (values.method === "CASH") {
      if (cashReceived < totalAmount) {
        setError("cash_received", {
          message: "ຈຳນວນເງິນໜ້ອຍກວ່າຍອດທີ່ຕ້ອງຊຳລະ",
        });
        return;
      }
      body = {
        bill_id: billId,
        method: "CASH",
        amount: totalAmount,
        cash: { received_amount: cashReceived },
      };
    } else if (values.method === "QR_PROMPTPAY") {
      body = {
        bill_id: billId,
        method: "QR_PROMPTPAY",
        amount: totalAmount,
        qr_promptpay: { received_amount: totalAmount },
      };
    } else {
      if (cashReceived + qrReceived !== totalAmount) {
        setError("cash_received", {
          message: `ຈຳນວນລວມຕ້ອງເທົ່າກັບ ${formatNumber(totalAmount)} ກີບ`,
        });
        return;
      }
      body = {
        bill_id: billId,
        method: "MIXED",
        amount: totalAmount,
        cash: { received_amount: cashReceived },
        qr_promptpay: { received_amount: qrReceived },
      };
    }

    mutate(body, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-screen">
        <DialogHeader>
          <DialogTitle className="font-body text-xl font-bold">
            ຊຳລະເງິນ
          </DialogTitle>
          <p className="text-sm text-zinc-500">
            ຍອດທີ່ຕ້ອງຊຳລະ:{" "}
            <span className="font-bold text-blue-500 text-base">
              {formatNumber(totalAmount)} ກີບ
            </span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pb-4">
          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2">
            {METHOD_TABS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                onClick={() => setValue("method", value)}
                className={cn(
                  "px-4 py-2",
                  method === value
                    ? "bg-teal-500 hover:bg-teal-600 text-white font-bold"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold",
                )}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* CASH */}
          {method === PaymentMethod.CASH && (
            <div className="space-y-2">
              <label className="text-sm font-medium">ຈຳນວນທີ່ລູກຄ້າຈ່າຍ</label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                className="text-lg"
                {...register("cash_received")}
              />
              {errors.cash_received && (
                <p className="text-red-500 text-sm">
                  {errors.cash_received.message}
                </p>
              )}
            </div>
          )}

          {/* QR */}
          {method === PaymentMethod.QR_PROMPTPAY && (
            <div className="bg-zinc-50 rounded-lg p-4 text-center space-y-1">
              <p className="text-zinc-500 text-sm">ຈຳນວນທີ່ຕ້ອງໂອນ</p>
              <p className="text-2xl font-bold text-blue-500">
                {formatNumber(totalAmount)} ກີບ
              </p>
            </div>
          )}

          {/* MIXED */}
          {method === PaymentMethod.MIXED && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">ເງິນສົດ</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("cash_received")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">QR Promptpay</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("qr_received")}
                />
              </div>
              {errors.cash_received && (
                <p className="text-red-500 text-sm">
                  {errors.cash_received.message}
                </p>
              )}
            </div>
          )}

          {/* Change amount — always visible */}
          <div className="bg-amber-50 flex items-center justify-between p-4 rounded-lg">
            <span className="font-bold text-xl text-amber-700">ເງິນທອນ</span>
            <span className="font-bold text-2xl text-amber-600">
              {formatNumber(changeAmount)} ກີບ
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4.5 py-2.5 text-base font-bold"
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-500 hover:bg-blue-600 font-bold px-4.5 py-2.5 text-base font-bold"
            >
              {isPending ? "ກຳລັງດຳເນີນການ..." : "ຢືນຢັນການຊຳລະ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
