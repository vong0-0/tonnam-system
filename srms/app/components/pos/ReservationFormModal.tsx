import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import {
  reservationFormSchema,
  type ReservationFormValues,
} from "@/schemas/reservation.schema";
import {
  useCreateReservation,
  useUpdateReservation,
} from "@/hooks/useReservations";
import { useTables } from "@/hooks/useTables";
import { TimePickerInput } from "@/components/common/TimePickerInput";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Reservation } from "@/types/entities";

interface ReservationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation?: Reservation;
}

export default function ReservationFormModal({
  open,
  onOpenChange,
  reservation,
}: ReservationFormModalProps) {
  const isEdit = !!reservation;

  const { tables } = useTables({
    limit: 100,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(reservationFormSchema, {
    defaultValues: {
      table_id: "",
      reserver_name: "",
      phone: "",
      party_size: 2,
      time_part: "",
      notes: "",
    },
  });

  const { mutate: create, isPending: isCreating } = useCreateReservation();
  const { mutate: update, isPending: isUpdating } = useUpdateReservation();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open && reservation) {
      reset({
        table_id: reservation.table_id,
        reserver_name: reservation.reserver_name,
        phone: reservation.phone,
        party_size: reservation.party_size,
        time_part: formatDate(reservation.reserved_at, DATE_FORMATS.TIME),
        notes: reservation.notes ?? "",
      });
    } else if (!open) {
      reset({
        table_id: "",
        reserver_name: "",
        phone: "",
        party_size: 2,
        time_part: "",
        notes: "",
      });
    }
  }, [open, reservation, reset]);

  const onSubmit: SubmitHandler<ReservationFormValues> = (values) => {
    const today = formatDate(new Date(), DATE_FORMATS.DATE_ISO);
    const reserved_at = new Date(`${today}T${values.time_part}:00`).toISOString();
    const body = {
      table_id: values.table_id,
      reserver_name: values.reserver_name,
      phone: values.phone,
      party_size: Number(values.party_size),
      reserved_at,
      notes: values.notes || null,
    };

    if (isEdit) {
      update(
        { id: reservation._id, body },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create(body, { onSuccess: () => onOpenChange(false) });
    }
  };

  const todayLabel = formatDate(new Date(), DATE_FORMATS.DATE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-body font-bold text-ink-900">
            {isEdit ? "ແກ້ໄຂການຈອງ" : "ສ້າງການຈອງໃໝ່"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            {isEdit
              ? "ແກ້ໄຂຂໍ້ມູນການຈອງ (ໄດ້ສະເພາະໃນສະຖານະ ລໍຖ້າ)"
              : "ກຸ່ງໝາຍໃສ່ຂໍ້ມູນການຈອງ"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-2 space-y-5 p-4 pt-0"
        >
          {/* Table select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ໂຕະ <span className="text-danger">*</span>
            </label>
            <select
              {...register("table_id")}
              className="flex h-9 w-full rounded-md border border-ink-300 bg-paper px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ink-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">ເລືອກໂຕະ</option>
              {tables
                .filter((t) => t.status === "AVAILABLE" || t._id === reservation?.table_id)
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.table_name} ({t.capacity} ທີ່ນັ່ງ)
                  </option>
                ))}
            </select>
            {errors.table_id && (
              <p className="text-xs text-danger">{errors.table_id.message}</p>
            )}
          </div>

          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຊື່ຜູ້ຈອງ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("reserver_name")}
                placeholder="ສົມໃຈ ສີດາ"
                className="border-ink-300 bg-paper"
              />
              {errors.reserver_name && (
                <p className="text-xs text-danger">
                  {errors.reserver_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ເບີໂທ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("phone")}
                placeholder="020XXXXXXXX"
                className="border-ink-300 bg-paper"
              />
              {errors.phone && (
                <p className="text-xs text-danger">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Party size */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ຈຳນວນຄົນ <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="party_size"
              render={({ field }) => (
                <QuantityStepper
                  value={field.value || 1}
                  onChange={field.onChange}
                  min={1}
                  size="md"
                  className="w-full justify-between border border-ink-300 rounded-lg overflow-hidden"
                  minusClassName="rounded-none border-none bg-zinc-300"
                  plusClassName="rounded-none border-none"
                />
              )}
            />
            {errors.party_size && (
              <p className="text-xs text-danger">{errors.party_size.message}</p>
            )}
          </div>

          {/* Date (static) + Time */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ວັນ ແລະ ເວລາ <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 items-start">
              {/* Today — read-only */}
              <div className="flex h-auto items-center gap-1.5 rounded-md border border-ink-200 bg-ink-50 px-3 py-2">
                <CalendarDays size={14} className="shrink-0 text-ink-400" />
                <span className="text-sm text-ink-600">{todayLabel}</span>
              </div>

              {/* Time picker */}
              <div>
                <Controller
                  control={control}
                  name="time_part"
                  render={({ field }) => (
                    <TimePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="ເວລາ"
                    />
                  )}
                />
                {errors.time_part && (
                  <p className="text-xs text-danger mt-1">
                    {errors.time_part.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ໝາຍເຫດ</label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="ຕ້ອງການໂຕະຕິດໜ້າຕ່າງ, ແພ້ອາຫານ..."
              className="flex w-full rounded-md border border-ink-300 bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-400 resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2"
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800"
            >
              {isPending
                ? "ກຳລັງບັນທຶກ..."
                : isEdit
                  ? "ບັນທຶກການປ່ຽນແປງ"
                  : "ສ້າງການຈອງ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
