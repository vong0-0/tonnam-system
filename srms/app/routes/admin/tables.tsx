import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
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
import { ArrowUpDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import TableStatusBadge from "@/components/common/TableStatusBadge";
import {
  useAdminTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from "@/hooks/useTables";
import { useTableListRealtime } from "@/hooks/useTableListRealtime";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import { createTableSchema, updateTableSchema } from "@/schemas/table.schema";
import type {
  CreateTableInput,
  UpdateTableInput,
} from "@/schemas/table.schema";
import { TableStatus } from "@/types/enums";
import type { Table as TableEntity } from "@/types/entities";
import { cn } from "@/lib/utils";
import { exportMasterDataExcel } from "@/lib/master-data-excel";
import { formatDate, DATE_FORMATS } from "@/lib/date";

const PAGE_SIZE = 20;

const STATUS_CONFIG = {
  [TableStatus.AVAILABLE]: { dot: "bg-teal-500", label: "ວ່າງ" },
  [TableStatus.RESERVED]: { dot: "bg-blue-500", label: "ຈອງແລ້ວ" },
  [TableStatus.OCCUPIED]: { dot: "bg-amber-500", label: "ມີລູກຄ້າ" },
  [TableStatus.PAID]: { dot: "bg-slate-400", label: "ຊຳລະແລ້ວ" },
} as const;

const STATUS_FILTERS = [
  { value: "ALL" as const, label: "ທັງໝົດ" },
  { value: TableStatus.AVAILABLE, label: "ວ່າງ" },
  { value: TableStatus.RESERVED, label: "ຈອງແລ້ວ" },
  { value: TableStatus.OCCUPIED, label: "ມີລູກຄ້າ" },
  { value: TableStatus.PAID, label: "ຊຳລະແລ້ວ" },
];

function SortButton({
  column,
  label,
}: {
  column: Column<TableEntity, unknown>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-semibold text-white hover:bg-white/10 hover:text-white"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
    </Button>
  );
}

function CreateTableDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate, isPending } = useCreateTable();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(createTableSchema, {
    defaultValues: {
      table_name: "",
      capacity: undefined as unknown as number,
      is_temporary: false,
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit: SubmitHandler<CreateTableInput> = (values) => {
    mutate(values, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink-900">
            ເພີ່ມໂຕະໃໝ່
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            ເພີ່ມໂຕະໃໝ່ເຂົ້າສູ່ລະບົບ
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-2 space-y-5 p-4 pt-0"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຊື່ໂຕະ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("table_name")}
                placeholder="ເຊັ່ນ: T01, A1"
                className="border-ink-300 bg-paper"
                aria-invalid={!!errors.table_name}
              />
              {errors.table_name && (
                <p className="text-xs text-danger">
                  {errors.table_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຈຳນວນທີ່ນັ່ງ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("capacity")}
                type="number"
                min={1}
                placeholder="4"
                className="border-ink-300 bg-paper"
                aria-invalid={!!errors.capacity}
              />
              {errors.capacity && (
                <p className="text-xs text-danger">{errors.capacity.message}</p>
              )}
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              {...register("is_temporary")}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-green cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-ink-700">ໂຕະຊົ່ວຄາວ</p>
              <p className="text-xs text-ink-500">
                ໃຊ້ສຳລັບໂຕະທີ່ຈັດສ້າງຂຶ້ນຊົ່ວຄາວ ເຊັ່ນ: ໂຕະພິເສດງານລ້ຽງ
              </p>
            </div>
          </label>
          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="px-4 py-2"
              onClick={() => onOpenChange(false)}
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 px-4 py-2 bg-green hover:bg-green-light text-white"
            >
              {isPending ? "ກຳລັງເພີ່ມ..." : "ເພີ່ມໂຕະ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTableDialog({
  table,
  open,
  onOpenChange,
}: {
  table: TableEntity;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate, isPending } = useUpdateTable();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(updateTableSchema, {
    defaultValues: { table_name: table.table_name, capacity: table.capacity, is_temporary: table.is_temporary },
  });

  useEffect(() => {
    reset({ table_name: table.table_name, capacity: table.capacity, is_temporary: table.is_temporary });
  }, [table._id, reset]);

  const onSubmit: SubmitHandler<UpdateTableInput> = (values) => {
    mutate(
      { id: table._id, ...values },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-body font-bold text-ink-900">
            ແກ້ໄຂໂຕະ
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            ແກ້ໄຂຂໍ້ມູນໂຕະ "{table.table_name}"
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-2 space-y-5 p-4 pt-0"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຊື່ໂຕະ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("table_name")}
                className="border-ink-300 bg-paper"
                aria-invalid={!!errors.table_name}
              />
              {errors.table_name && (
                <p className="text-xs text-danger">
                  {errors.table_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຈຳນວນທີ່ນັ່ງ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("capacity")}
                type="number"
                min={1}
                className="border-ink-300 bg-paper"
                aria-invalid={!!errors.capacity}
              />
              {errors.capacity && (
                <p className="text-xs text-danger">{errors.capacity.message}</p>
              )}
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              {...register("is_temporary")}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-green cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-ink-700">ໂຕະຊົ່ວຄາວ</p>
              <p className="text-xs text-ink-500">
                ໃຊ້ສຳລັບໂຕະທີ່ຈັດສ້າງຂຶ້ນຊົ່ວຄາວ ເຊັ່ນ: ໂຕະພິເສດງານລ້ຽງ
              </p>
            </div>
          </label>
          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="px-4 py-2"
              onClick={() => onOpenChange(false)}
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 px-4 py-2 bg-green hover:bg-green-light text-white"
            >
              {isPending ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTableDialog({
  table,
  open,
  onOpenChange,
}: {
  table: TableEntity;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate, isPending } = useDeleteTable();

  function handleConfirm() {
    mutate(table._id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="ລົບໂຕະ"
      description={
        <>
          ທ່ານຕ້ອງການລົບໂຕະ{" "}
          <span className="font-semibold text-ink-900">
            "{table.table_name}"
          </span>{" "}
          ແທ້ ຫຼື ບໍ່?
        </>
      }
      confirmLabel={isPending ? "ກຳລັງລົບ..." : "ລົບ"}
      variant="destructive"
      onConfirm={handleConfirm}
    />
  );
}

export default function AdminTables() {
  useTableListRealtime();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<TableStatus | "ALL">("ALL");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "table_name", desc: false },
  ]);
  const [pageIndex, setPageIndex] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editTarget, setEditTarget] = useState<TableEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableEntity | null>(null);

  const { data, isLoading } = useAdminTables();
  const allTables: TableEntity[] = data?.data ?? [];

  const stats = useMemo(() => {
    const counts = {
      total: allTables.length,
      [TableStatus.AVAILABLE]: 0,
      [TableStatus.RESERVED]: 0,
      [TableStatus.OCCUPIED]: 0,
      [TableStatus.PAID]: 0,
    };
    allTables.forEach((t) => counts[t.status]++);
    return counts;
  }, [allTables]);

  const filtered = useMemo(() => {
    const lower = debouncedSearch.toLowerCase();
    return allTables.filter((t) => {
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchesSearch =
        !lower || t.table_name.toLowerCase().includes(lower);
      return matchesStatus && matchesSearch;
    });
  }, [allTables, statusFilter, debouncedSearch]);

  const columns = useMemo<ColumnDef<TableEntity>[]>(
    () => [
      {
        accessorKey: "table_name",
        header: ({ column }) => <SortButton column={column} label="ຊື່ໂຕະ" />,
        cell: ({ row }) => (
          <span className="font-medium text-ink-900">
            {row.original.table_name}
          </span>
        ),
      },
      {
        accessorKey: "capacity",
        header: ({ column }) => <SortButton column={column} label="ທີ່ນັ່ງ" />,
        cell: ({ row }) => (
          <span className="text-ink-700">{row.original.capacity} ທີ່ນັ່ງ</span>
        ),
      },
      {
        accessorKey: "status",
        header: "ສະຖານະ",
        cell: ({ row }) => <TableStatusBadge status={row.original.status} />,
        enableSorting: false,
      },
      {
        accessorKey: "is_temporary",
        header: "ປະເພດ",
        cell: ({ row }) =>
          row.original.is_temporary ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              ຊົ່ວຄາວ
            </span>
          ) : (
            <span className="text-sm text-ink-400">ປົກກະຕິ</span>
          ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: () => <div className="text-right">ຈັດການ</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs border-ink-200 text-ink-700 hover:bg-ink-50"
              onClick={() => setEditTarget(row.original)}
            >
              ແກ້ໄຂ
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs border-danger/30 text-danger hover:bg-danger/5"
              onClick={() => setDeleteTarget(row.original)}
            >
              ລົບ
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
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

  function handleStatusFilter(value: TableStatus | "ALL") {
    setStatusFilter(value);
    setPageIndex(0);
  }

  function handleSearchChange(v: string) {
    setSearch(v);
    setPageIndex(0);
  }

  const pageCount = table.getPageCount();
  const currentPage = pageIndex + 1;

  async function handleExport() {
    const exportTables = table.getSortedRowModel().rows.map((row) => row.original);
    setIsExporting(true);
    try {
      await exportMasterDataExcel(
        "TonNam_Tables_" + formatDate(new Date(), DATE_FORMATS.DATE_ISO) + ".xlsx",
        [{
          name: "ໂຕະ - Tables",
          title: "ໂຕະຮ້ານອາຫານ / Restaurant tables",
          headers: [
            "ຊື່ໂຕະ / Table name",
            "ຈຳນວນທີ່ນັ່ງ / Capacity",
            "ສະຖານະ / Status",
            "ປະເພດ / Type",
          ],
          rows: exportTables.map((item) => [
            item.table_name,
            item.capacity,
            {
              AVAILABLE: "ວ່າງ",
              RESERVED: "ຈອງແລ້ວ",
              OCCUPIED: "ມີລູກຄ້າ",
              PAID: "ເຊັກບິນແລ້ວ",
            }[item.status],
            item.is_temporary ? "ຊົ່ວຄາວ" : "ປົກກະຕິ",

          ]),
          columnWidths: [24, 22, 22, 18, 22, 22],
        }],
      );
      toast.success("ດາວໂຫລດ Excel ສຳເລັດ.");
    } catch (error) {
      console.error("Failed to export table data", error);
      toast.error("ດາວໂຫລດ Excel ບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar: search (left) | create button (right) */}
      <div className="flex items-center justify-between">
        <SearchInput
          value={search}
          placeholder="ຄົ້ນຫາຊື່ໂຕະ..."
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange("")}
          className="w-64 [&_input]:border-ink-300 [&_input]:bg-paper"
        />
        <div className="flex items-center gap-2">
          <ExportExcelButton
            onClick={handleExport}
            disabled={isLoading}
            isExporting={isExporting}
          />
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            <Plus size={15} />
            ເພີ່ມໂຕະໃໝ່
          </Button></div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))
          : STATUS_FILTERS.map(({ value, label }) => {
            const count = value === "ALL" ? stats.total : stats[value];
            const isActive = statusFilter === value;
            return (
              <button
                key={value}
                onClick={() => handleStatusFilter(value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-green bg-green text-white"
                    : "border-ink-100 bg-paper text-ink-700 hover:border-green/40 hover:text-green",
                )}
              >
                {value !== "ALL" && (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isActive
                        ? "bg-white"
                        : STATUS_CONFIG[value as TableStatus].dot,
                    )}
                  />
                )}
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs leading-none",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-ink-100 text-ink-600",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
                  ບໍ່ພົບໂຕະທີ່ຄົ້ນຫາ
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

      {/* Dialogs */}
      <CreateTableDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editTarget && (
        <EditTableDialog
          table={editTarget}
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteTableDialog
          table={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
