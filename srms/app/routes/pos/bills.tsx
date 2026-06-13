import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePickerFilter } from "@/components/common/DatePickerFilter";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { DataTable } from "@/components/admin/DataTable";
import { makeBillColumns } from "@/components/admin/bills-columns";
import BillDetailSheet from "@/components/common/BillDetailSheet";
import { AppSelect, type SelectOption } from "@/components/common/AppSelect";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { useBillsPage } from "@/hooks/useBills";
import type { BillStatus } from "@/types/enums";
import type { Bill } from "@/types/entities";

const statusOptions: SelectOption[] = [
  { value: "ALL", label: "ທຸກສະຖານະ" },
  { value: "OPEN", label: "ອໍເດີ້ໃຫມ່" },
  { value: "PAID", label: "ຊຳລະແລ້ວ" },
  { value: "CANCELLED", label: "ຍົກເລີກ" },
];

const LIMIT = 20;

export default function PosBills() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BillStatus | "ALL">("ALL");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const { data, isLoading } = useBillsPage({
    page,
    limit: LIMIT,
    status,
    search: debouncedSearch || undefined,
    date_from: dateFrom
      ? formatDate(dateFrom, DATE_FORMATS.DATE_ISO)
      : undefined,
    date_to: dateTo ? formatDate(dateTo, DATE_FORMATS.DATE_ISO) : undefined,
  });

  const bills: Bill[] = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  console.log("bills", bills);

  function handleStatusChange(v: string) {
    setStatus(v as BillStatus | "ALL");
    setPage(1);
  }

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleDateFromChange(d: Date | undefined) {
    setDateFrom(d);
    setPage(1);
  }

  function handleDateToChange(d: Date | undefined) {
    setDateTo(d);
    setPage(1);
  }

  const columns = useMemo(
    () => makeBillColumns((bill) => setSelectedBillId(bill._id)),
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange("")}
          placeholder="ຄົ້ນຫາເລກບິນ..."
          className="w-56 [&_input]:border-ink-300 [&_input]:bg-paper"
        />

        <AppSelect
          options={statusOptions}
          value={status}
          onValueChange={handleStatusChange}
          placeholder="ທຸກສະຖານະ"
          triggerClassName="w-40 h-9 border-ink-300 bg-paper"
        />
        <DatePickerFilter
          value={dateFrom}
          onChange={handleDateFromChange}
          placeholder="ຈາກວັນທີ"
          className="w-40 [&_button]:bg-paper"
        />
        <span className="text-ink-400 text-sm">–</span>
        <DatePickerFilter
          value={dateTo}
          onChange={handleDateToChange}
          placeholder="ຫາວັນທີ"
          className="w-40 [&_button]:bg-paper"
        />
      </div>

      <DataTable columns={columns} data={bills} isLoading={isLoading} />

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

      <BillDetailSheet
        billId={selectedBillId}
        onClose={() => setSelectedBillId(null)}
      />
    </div>
  );
}
