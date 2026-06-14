import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { DatePickerFilter } from "@/components/common/DatePickerFilter";
import { AppSelect, type SelectOption } from "@/components/common/AppSelect";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { AuditLog, AuditLogEntityName } from "@/types/audit-log";

const LIMIT = 20;

const ACTION_LABELS: Record<string, string> = {
  CANCEL_BILL: "ຍົກເລີກບິນ",
  UPDATE_BILL: "ແກ້ໄຂບິນ",
  SPLIT_BILL: "ແຍກບິນ",
  MERGE_TABLES: "ລວມໂຕະ",
  UNMERGE_TABLES: "ຍົກເລີກລວມໂຕະ",
  CANCEL_ORDER_ITEM: "ຍົກເລີກລາຍການ",
  UPDATE_ORDER_ITEM_QUANTITY: "ແກ້ໄຂຈຳນວນ",
};

const ENTITY_LABELS: Record<string, string> = {
  Bill: "ບິນ",
  Order: "ອໍເດີ",
  OrderItem: "ລາຍການ",
  Table: "ໂຕະ",
  TableMergeGroup: "ລວມໂຕະ",
  Payment: "ການຊຳລະ",
};

function getActionBadgeClass(action: string): string {
  switch (action) {
    case "CANCEL_BILL":
    case "CANCEL_ORDER_ITEM":
      return "bg-red-100 text-red-700";
    case "UPDATE_BILL":
    case "UPDATE_ORDER_ITEM_QUANTITY":
      return "bg-amber-100 text-amber-700";
    case "SPLIT_BILL":
      return "bg-blue-100 text-blue-700";
    case "MERGE_TABLES":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-ink-100 text-ink-600";
  }
}

const entityOptions: SelectOption[] = [
  { value: "ALL", label: "ທຸກປະເພດ" },
  { value: "Bill", label: "ບິນ" },
  { value: "Order", label: "ອໍເດີ" },
  { value: "OrderItem", label: "ລາຍການ" },
  { value: "Table", label: "ໂຕະ" },
  { value: "TableMergeGroup", label: "ລວມໂຕະ" },
  { value: "Payment", label: "ການຊຳລະ" },
];

const actionOptions: SelectOption[] = [
  { value: "ALL", label: "ທຸກການກະທຳ" },
  { value: "CANCEL_BILL", label: "ຍົກເລີກບິນ" },
  { value: "UPDATE_BILL", label: "ແກ້ໄຂບິນ" },
  { value: "SPLIT_BILL", label: "ແຍກບິນ" },
  { value: "MERGE_TABLES", label: "ລວມໂຕະ" },
  { value: "UNMERGE_TABLES", label: "ຍົກເລີກລວມໂຕະ" },
  { value: "CANCEL_ORDER_ITEM", label: "ຍົກເລີກລາຍການ" },
  { value: "UPDATE_ORDER_ITEM_QUANTITY", label: "ແກ້ໄຂຈຳນວນ" },
];

function AuditLogDetailSheet({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={log !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] flex flex-col p-0 gap-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <SheetTitle className="font-body font-bold text-lg text-ink-900">
              ລາຍລະອຽດການດຳເນີນການ
            </SheetTitle>
            {log && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  getActionBadgeClass(log.action),
                )}
              >
                {ACTION_LABELS[log.action] ?? log.action}
              </span>
            )}
          </div>
        </SheetHeader>

        {log && (
          <div className="flex-1 overflow-y-auto">
            {/* Info grid */}
            <div className="px-6 py-4 border-b space-y-3">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                ຂໍ້ມູນທົ່ວໄປ
              </p>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                <span className="text-ink-500">ວັນທີ-ເວລາ</span>
                <span className="text-ink-900">
                  {formatDate(log.created_at, DATE_FORMATS.DATE_TIME)}
                </span>

                <span className="text-ink-500">ຜູ້ດຳເນີນການ</span>
                <span className="font-medium text-ink-900">
                  {log.actor.username}
                  <span className="ml-1.5 text-xs text-ink-400 font-normal">
                    ({log.actor.role})
                  </span>
                </span>

                <span className="text-ink-500">ປະເພດ</span>
                <span className="text-ink-900">
                  {ENTITY_LABELS[log.entity_name] ?? log.entity_name}
                </span>

                <span className="text-ink-500">ID ທີ່ຮັບຜົນ</span>
                <span className="font-mono text-xs text-ink-700 break-all">
                  {log.entity_id}
                </span>

                <span className="text-ink-500">ເຫດຜົນ</span>
                <span className="text-ink-900">{log.reason}</span>
              </div>
            </div>

            {/* Before state */}
            <div className="px-6 py-4 border-b space-y-2">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                ກ່ອນແກ້ໄຂ
              </p>
              {log.before_state ? (
                <pre className="bg-ink-50 rounded-md p-3 text-xs font-mono text-ink-700 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                  {JSON.stringify(log.before_state, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-ink-400">—</p>
              )}
            </div>

            {/* After state */}
            <div className="px-6 py-4 space-y-2">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                ຫຼັງແກ້ໄຂ
              </p>
              {log.after_state ? (
                <pre className="bg-ink-50 rounded-md p-3 text-xs font-mono text-ink-700 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                  {JSON.stringify(log.after_state, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-ink-400">—</p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState<AuditLogEntityName | "ALL">(
    "ALL",
  );
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, refetch, isFetching } = useAuditLogs({
    page,
    limit: LIMIT,
    entity_name:
      entityFilter !== "ALL" ? (entityFilter as AuditLogEntityName) : undefined,
    action: actionFilter !== "ALL" ? actionFilter : undefined,
    date: dateFilter
      ? formatDate(dateFilter, DATE_FORMATS.DATE_ISO)
      : undefined,
  });

  const logs: AuditLog[] = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  function handleEntityChange(v: string) {
    setEntityFilter(v as AuditLogEntityName | "ALL");
    setPage(1);
  }

  function handleActionChange(v: string) {
    setActionFilter(v);
    setPage(1);
  }

  function handleDateChange(d: Date | undefined) {
    setDateFilter(d);
    setPage(1);
  }

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "ວັນທີ-ເວລາ",
        cell: ({ row }) => (
          <span className="text-ink-600 text-sm whitespace-nowrap">
            {formatDate(row.getValue("created_at"), DATE_FORMATS.DATE_TIME)}
          </span>
        ),
      },
      {
        id: "actor",
        header: "ຜູ້ດຳເນີນການ",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink-900 text-sm">
              {row.original.actor.username}
            </p>
            <p className="text-xs text-ink-500">{row.original.actor.role}</p>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "ການກະທຳ",
        cell: ({ row }) => {
          const action = row.getValue<string>("action");
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                getActionBadgeClass(action),
              )}
            >
              {ACTION_LABELS[action] ?? action}
            </span>
          );
        },
      },
      {
        accessorKey: "entity_name",
        header: "ປະເພດ",
        cell: ({ row }) => {
          const name = row.getValue<string>("entity_name");
          return (
            <span className="inline-flex items-center rounded-full border border-ink-200 px-2.5 py-0.5 text-xs text-ink-600 whitespace-nowrap">
              {ENTITY_LABELS[name] ?? name}
            </span>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "ເຫດຜົນ",
        cell: ({ row }) => (
          <span className="text-sm text-ink-700 truncate block max-w-[200px]">
            {row.getValue("reason")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "ລາຍລະອຽດ",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs border-ink-200 text-ink-700 hover:bg-ink-50"
            onClick={() => setSelectedLog(row.original)}
          >
            ລາຍລະອຽດ
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <AppSelect
          options={entityOptions}
          value={entityFilter}
          onValueChange={handleEntityChange}
          placeholder="ທຸກປະເພດ"
          triggerClassName="w-44 h-9 border-ink-300 bg-paper"
        />
        <AppSelect
          options={actionOptions}
          value={actionFilter}
          onValueChange={handleActionChange}
          placeholder="ທຸກການກະທຳ"
          triggerClassName="w-48 h-9 border-ink-300 bg-paper"
        />
        <DatePickerFilter
          value={dateFilter}
          onChange={handleDateChange}
          placeholder="ກອງຕາມວັນທີ"
          className="w-44 [&_button]:bg-paper"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 gap-1.5 border-ink-300 bg-paper text-ink-700"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          ໂຫລດໃໝ່
        </Button>
      </div>

      <DataTable columns={columns} data={logs} isLoading={isLoading} />

      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            ສະແດງ {Math.min((page - 1) * LIMIT + 1, total)}–
            {Math.min(page * LIMIT, total)} ຈາກ {total} ລາຍການ
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AuditLogDetailSheet
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
