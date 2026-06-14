import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Controller } from "react-hook-form";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Column,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppSelect, type SelectOption } from "@/components/common/AppSelect";
import { DatePickerFilter } from "@/components/common/DatePickerFilter";
import { TimePickerInput } from "@/components/common/TimePickerInput";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import ReservationStatusBadge from "@/components/common/ReservationStatusBadge";
import {
  useReservationsPage,
  useCreateReservation,
  useUpdateReservation,
  useUpdateReservationStatus,
} from "@/hooks/useReservations";
import { useReservationsRealtime } from "@/hooks/useReservationsRealtime";
import { useAdminTables } from "@/hooks/useTables";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { adminReservationSchema } from "@/schemas/reservation.schema";
import type { AdminReservationInput } from "@/schemas/reservation.schema";
import { ReservationStatus, TableStatus } from "@/types/enums";
import type { Reservation, Table as TableEntity } from "@/types/entities";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "ທຸກສະຖານະ" },
  { value: ReservationStatus.PENDING, label: "ລໍຖ້າ" },
  { value: ReservationStatus.CONFIRMED, label: "ຢືນຢັນແລ້ວ" },
  { value: ReservationStatus.CANCELLED, label: "ຍົກເລີກ" },
];

function SortButton({
  column,
  label,
  align = "left",
}: {
  column: Column<Reservation, unknown>;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 font-semibold text-white hover:bg-white/10 hover:text-white",
        align === "right" && "ml-0 -mr-3 flex-row-reverse",
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
    </Button>
  );
}

interface ReservationFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reservation?: Reservation;
  allTables: TableEntity[];
}

function ReservationFormModal({
  open,
  onOpenChange,
  reservation,
  allTables,
}: ReservationFormModalProps) {
  const isEdit = !!reservation;
  const { mutate: create, isPending: isCreating } = useCreateReservation();
  const { mutate: update, isPending: isUpdating } = useUpdateReservation();
  const isPending = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(adminReservationSchema, {
    defaultValues: {
      table_id: "",
      reserver_name: "",
      phone: "",
      party_size: 2,
      date_part: new Date().toISOString().slice(0, 10),
      time_part: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && reservation) {
      reset({
        table_id: reservation.table_id,
        reserver_name: reservation.reserver_name,
        phone: reservation.phone,
        party_size: reservation.party_size,
        date_part: formatDate(reservation.reserved_at, DATE_FORMATS.DATE_ISO),
        time_part: formatDate(reservation.reserved_at, DATE_FORMATS.TIME),
        notes: reservation.notes ?? "",
      });
    } else if (!open) {
      reset({
        table_id: "",
        reserver_name: "",
        phone: "",
        party_size: 2,
        date_part: new Date().toISOString().slice(0, 10),
        time_part: "",
        notes: "",
      });
    }
  }, [open, reservation, reset]);

  const tableOptions = allTables.filter(
    (t) =>
      t.status === TableStatus.AVAILABLE || t._id === reservation?.table_id,
  );

  const onSubmit: SubmitHandler<AdminReservationInput> = (values) => {
    const reserved_at = new Date(
      `${values.date_part}T${values.time_part}:00`,
    ).toISOString();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-body text-xl font-bold text-ink-900">
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
              {tableOptions.map((t) => (
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

          {/* Date + Time */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ວັນ ແລະ ເວລາ <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <Controller
                  control={control}
                  name="date_part"
                  render={({ field }) => (
                    <div className="flex h-auto items-center gap-1.5 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 cursor-default relative">
                      <CalendarDays size={14} className="shrink-0 text-ink-300" />
                      <input
                        type="date"
                        value={field.value}
                        onChange={() => {}}
                        readOnly
                        className="text-sm bg-transparent focus:outline-none w-full text-ink-500 [color-scheme:light] cursor-default select-none"
                      />
                    </div>
                  )}
                />
                {errors.date_part && (
                  <p className="text-xs text-danger mt-1">
                    {errors.date_part.message}
                  </p>
                )}
              </div>
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
              className="gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white"
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

export default function AdminReservations() {
  useReservationsRealtime();

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL",
  );
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | undefined>(
    undefined,
  );
  const [confirmAction, setConfirmAction] = useState<{
    type: "confirm" | "cancel";
    reservation: Reservation;
  } | null>(null);

  const { data, isLoading } = useReservationsPage({
    date: dateFilter
      ? formatDate(dateFilter, DATE_FORMATS.DATE_ISO)
      : undefined,
    limit: 200,
  });
  const { data: tablesData } = useAdminTables();
  const { mutate: updateStatus } = useUpdateReservationStatus();

  const allReservations: Reservation[] = data?.data ?? [];
  const allTables: TableEntity[] = tablesData?.data ?? [];

  const tableMap = useMemo(() => {
    const map: Record<string, string> = {};
    allTables.forEach((t) => {
      map[t._id] = t.table_name;
    });
    return map;
  }, [allTables]);

  const filtered = useMemo(() => {
    const lower = debouncedSearch.toLowerCase();
    return allReservations.filter((r) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchSearch =
        !lower ||
        r.reserver_name.toLowerCase().includes(lower) ||
        r.phone.includes(lower);
      return matchStatus && matchSearch;
    });
  }, [allReservations, statusFilter, debouncedSearch]);

  const columns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: "table_id",
        header: "ໂຕະ",
        cell: ({ row }) => (
          <span className="font-medium text-ink-900">
            {tableMap[row.original.table_id] ?? "—"}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "reserver_name",
        header: ({ column }) => <SortButton column={column} label="ຊື່ຜູ້ຈອງ" />,
        cell: ({ row }) => (
          <span className="font-medium text-ink-900">
            {row.original.reserver_name}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "ເບີໂທ",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-ink-700">
            {row.original.phone}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "party_size",
        header: () => <div className="text-right">ຄົນ</div>,
        cell: ({ row }) => (
          <div className="text-right text-ink-700">
            {row.original.party_size} ຄົນ
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "reserved_at",
        header: ({ column }) => <SortButton column={column} label="ເວລາ" />,
        cell: ({ row }) => (
          <span className="text-sm text-ink-600">
            {formatDate(row.original.reserved_at, DATE_FORMATS.DATE_TIME)}
          </span>
        ),
      },
      {
        accessorKey: "notes",
        header: "ໝາຍເຫດ",
        cell: ({ row }) => {
          const notes = row.original.notes;
          return notes ? (
            <span
              className="block max-w-[200px] truncate text-sm text-ink-600"
              title={notes}
            >
              {notes}
            </span>
          ) : (
            <span className="text-ink-300">—</span>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "ສະຖານະ",
        cell: ({ row }) => (
          <ReservationStatusBadge status={row.original.status} />
        ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: "ການດຳເນີນການ",
        cell: ({ row }) => {
          const r = row.original;
          if (r.status !== ReservationStatus.PENDING) {
            return <span className="text-ink-300">—</span>;
          }
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                onClick={() =>
                  setConfirmAction({ type: "confirm", reservation: r })
                }
                title="ຢືນຢັນ"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() =>
                  setConfirmAction({ type: "cancel", reservation: r })
                }
                title="ຍົກເລີກ"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-ink-200 text-ink-600 hover:bg-ink-50"
                onClick={() => {
                  setEditTarget(r);
                  setFormOpen(true);
                }}
                title="ແກ້ໄຂ"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [tableMap],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize: PAGE_SIZE } },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPageIndex(0);
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: PAGE_SIZE })
          : updater;
      setPageIndex(next.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  function handleConfirmAction() {
    if (!confirmAction) return;
    updateStatus(
      {
        id: confirmAction.reservation._id,
        status:
          confirmAction.type === "confirm"
            ? ReservationStatus.CONFIRMED
            : ReservationStatus.CANCELLED,
      },
      { onSuccess: () => setConfirmAction(null) },
    );
  }

  function openCreate() {
    setEditTarget(undefined);
    setFormOpen(true);
  }

  const pageCount = table.getPageCount();
  const currentPage = pageIndex + 1;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch((e.target as HTMLInputElement).value);
              setPageIndex(0);
            }}
            onClear={() => {
              setSearch("");
              setPageIndex(0);
            }}
            placeholder="ຄົ້ນຫາຊື່ຜູ້ຈອງ..."
            className="w-56 [&_input]:border-ink-300 [&_input]:bg-paper"
          />
          <AppSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as ReservationStatus | "ALL");
              setPageIndex(0);
            }}
            placeholder="ທຸກສະຖານະ"
            triggerClassName="w-40 h-9 border-ink-300 bg-paper"
          />
          <DatePickerFilter
            value={dateFilter}
            onChange={(d) => {
              setDateFilter(d);
              setPageIndex(0);
            }}
            placeholder="ເລືອກວັນທີ"
            disableFuture={false}
            className="w-44 [&_button]:bg-paper"
          />
          {dateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFilter(undefined);
                setPageIndex(0);
              }}
              className="h-9 text-ink-500 hover:text-ink-900"
            >
              ລ້າງ
            </Button>
          )}
        </div>
        <Button
          onClick={openCreate}
          className="gap-1.5 bg-green-700 hover:bg-green-800 h-9 px-4 text-white"
        >
          <Plus className="h-4 w-4" />
          ສ້າງການຈອງ
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-ink-100 bg-paper">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-green-light hover:bg-green-light"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-2 font-semibold text-white"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-4 py-2">
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-ink-100 hover:bg-ink-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-ink-400"
                >
                  ບໍ່ພົບການຈອງ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            ສະແດງ {Math.min(pageIndex * PAGE_SIZE + 1, filtered.length)}–
            {Math.min((pageIndex + 1) * PAGE_SIZE, filtered.length)} ຈາກ{" "}
            {filtered.length} ລາຍການ
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === pageCount}
              onClick={() =>
                setPageIndex((p) => Math.min(pageCount - 1, p + 1))
              }
              className="h-8 w-8 border-ink-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form modal */}
      <ReservationFormModal
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditTarget(undefined);
        }}
        reservation={editTarget}
        allTables={allTables}
      />

      {/* Confirm / Cancel dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => {
          if (!v) setConfirmAction(null);
        }}
        title={
          confirmAction?.type === "confirm"
            ? "ຢືນຢັນການຈອງ"
            : "ຍົກເລີກການຈອງ"
        }
        description={
          confirmAction?.type === "confirm"
            ? `ຢືນຢັນການຈອງຂອງ "${confirmAction?.reservation.reserver_name}" ແລະ ຈະປ່ຽນສະຖານະໂຕະເປັນ ຖືກໃຊ້ງານ`
            : `ຍົກເລີກການຈອງຂອງ "${confirmAction?.reservation.reserver_name}" ແລະ ຈະຄືນໂຕະໃຫ້ວ່າງ`
        }
        confirmLabel={
          confirmAction?.type === "confirm" ? "ຢືນຢັນ" : "ຍົກເລີກການຈອງ"
        }
        variant={confirmAction?.type === "cancel" ? "destructive" : "default"}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
