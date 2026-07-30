import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import { SearchInput } from "@/components/common/SearchInput";
import { formatNumber } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/image";
import type { MenuItem } from "@/types/entities";

const AVATAR_COLORS = [
  "#C45C3A",
  "#2D6A4F",
  "#6B7B3A",
  "#A0786E",
  "#2C7873",
  "#7B5E1A",
];
function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

interface MenuItemTableProps {
  isLoading: boolean;
  displayed: MenuItem[];
  categoryMap: Map<string, string>;
  availabilityPending: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onToggle: (
    item: MenuItem,
    field: "is_available" | "is_sold_out",
    value: boolean,
  ) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddItem: () => void;
  onExport: () => void;
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function MenuItemTable({
  isLoading,
  displayed,
  categoryMap,
  availabilityPending,
  search,
  onSearchChange,
  onSearchClear,
  onToggle,
  onEdit,
  onDelete,
  onAddItem,
  onExport,
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: MenuItemTableProps) {
  return (
    <div className="flex-1 min-w-0 pl-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={onSearchClear}
          placeholder="ຄົ້ນຫາເມນູ..."
          className="w-64 bg-white"
        />
        <div className="flex items-center gap-2">
          <ExportExcelButton onClick={onExport} disabled={isLoading} />
          <Button
            className="gap-1.5 flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
            onClick={onAddItem}
          >
            <Plus className="h-4 w-4" />
            ເພີ່ມເມນູໃໝ່
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink-100 bg-paper">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-light hover:bg-green-light">
              <TableHead className="w-16 px-4 py-2 font-semibold text-white">
                ຮູບ
              </TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white">
                ຊື່ເມນູ
              </TableHead>
              <TableHead className="w-36 px-4 py-2 font-semibold text-white">
                ໝວດໝູ່
              </TableHead>
              <TableHead className="w-28 px-4 py-2 text-right font-semibold text-white">
                ລາຄາ
              </TableHead>
              <TableHead className="w-24 px-4 py-2 text-center font-semibold text-white">
                ພ້ອມຂາຍ
              </TableHead>
              <TableHead className="w-20 px-4 py-2 text-center font-semibold text-white">
                ໝົດ
              </TableHead>
              <TableHead className="w-32 px-4 py-2 text-right font-semibold text-white">
                ຈັດການ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-ink-100">
                  <TableCell className="px-4 py-2">
                    <div className="w-11 h-11 rounded-lg bg-ink-50 animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-ink-50 rounded animate-pulse w-36" />
                      <div className="h-3 bg-ink-50 rounded animate-pulse w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="h-5 bg-ink-50 rounded-full animate-pulse w-20" />
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="h-3.5 bg-ink-50 rounded animate-pulse w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="px-4 py-2" />
                  <TableCell className="px-4 py-2" />
                  <TableCell className="px-4 py-2" />
                </TableRow>
              ))
            ) : displayed.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-4 py-16 text-center text-ink-500 text-sm"
                >
                  ບໍ່ພົບລາຍການ
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((item) => (
                <TableRow
                  key={item._id}
                  className={`border-ink-100 transition-opacity hover:bg-ink-50/50 ${!item.is_available ? "opacity-50" : ""
                    }`}
                >
                  <TableCell className="px-4 py-2">
                    {resolveImageUrl(item.image_url) ? (
                      <img
                        src={resolveImageUrl(item.image_url)!}
                        alt={item.name}
                        className="max-w-11 max-h-11 w-screen h-screen rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-semibold text-sm select-none"
                        style={{ backgroundColor: getAvatarColor(item.name) }}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <p className="text-sm font-medium text-ink-900 line-clamp-1">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-ink-50 text-ink-600 border border-ink-100">
                      {categoryMap.get(item.category_id) ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right text-sm text-ink-700 tabular-nums">
                    {formatNumber(item.price)} ກີບ
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(v) => onToggle(item, "is_available", v)}
                      disabled={availabilityPending}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <Switch
                      checked={item.is_sold_out}
                      onCheckedChange={(v) => onToggle(item, "is_sold_out", v)}
                      disabled={availabilityPending || !item.is_available}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs border-ink-200 text-ink-700 hover:bg-ink-50"
                        onClick={() => onEdit(item)}
                      >
                        ແກ້ໄຂ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs border-danger/30 text-danger hover:bg-danger/5"
                        onClick={() => onDelete(item)}
                      >
                        ລົບ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            ສະແດງ {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
            ຈາກ {total} ລາຍການ
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-ink-600 tabular-nums">
              ໜ້າ {page} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
