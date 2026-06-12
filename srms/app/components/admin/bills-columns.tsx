import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import BillStatusBadge from "@/components/common/BillStatusBadge";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import type { Bill } from "@/types/entities";

export function makeBillColumns(
  onManage: (bill: Bill) => void,
): ColumnDef<Bill>[] {
  return [
    {
      accessorKey: "short_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ເລກບິນ
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-ink-900">
          {row.getValue("short_id")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "ໂຕະ",
      cell: ({ row }) => (
        <span className="text-ink-700">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ເວລາເປີດ
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-ink-600 text-sm">
          {formatDate(row.getValue("created_at"), DATE_FORMATS.DATE_TIME)}
        </span>
      ),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ອັບເດດລ່າສຸດ
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-ink-600 text-sm">
          {formatDate(row.getValue("updated_at"), DATE_FORMATS.DATE_TIME)}
        </span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="-mr-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ຍອດລວມ
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium text-ink-900">
          {formatNumber(row.getValue("total_amount"))} ກີບ
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ສະຖານະ
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => <BillStatusBadge status={row.getValue("status")} />,
    },
    {
      id: "payment_method",
      header: "ການຊຳລະ",
      cell: () => <span className="text-ink-300">—</span>,
    },
    {
      id: "actions",
      header: "ຈັດການ",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs border-ink-200 text-ink-700 hover:bg-ink-50"
          onClick={() => onManage(row.original)}
        >
          ຈັດການ
        </Button>
      ),
    },
  ];
}
