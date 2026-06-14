import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { formatNumber } from "@/lib/utils";
import type { MenuItem } from "@/types/entities";

const AVATAR_COLORS = ["#C45C3A", "#2D6A4F", "#6B7B3A", "#A0786E", "#2C7873", "#7B5E1A"];
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
  onToggle: (item: MenuItem, field: "is_available" | "is_sold_out", value: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddItem: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
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
  hasMore,
  onLoadMore,
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
        <Button
          className="gap-1.5 flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4" />
          ເພີ່ມເມນູໃໝ່
        </Button>
      </div>

      <div className="bg-paper rounded-xl border border-ink-100 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-ink-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-16">
                ຮູບ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                ຊື່ເມນູ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-36">
                ໝວດໝູ່
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider w-28">
                ລາຄາ
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-ink-500 uppercase tracking-wider w-24">
                ພ້ອມຂາຍ
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-ink-500 uppercase tracking-wider w-20">
                ໝົດ
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider w-32">
                ຈັດການ
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-ink-100">
                  <td className="px-4 py-3">
                    <div className="w-11 h-11 rounded-lg bg-ink-50 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-ink-50 rounded animate-pulse w-36" />
                      <div className="h-3 bg-ink-50 rounded animate-pulse w-24" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 bg-ink-50 rounded-full animate-pulse w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3.5 bg-ink-50 rounded animate-pulse w-16 ml-auto" />
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                </tr>
              ))
              : displayed.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-ink-500 text-sm">
                      ບໍ່ພົບລາຍການ
                    </td>
                  </tr>
                )
                : displayed.map((item) => (
                  <tr
                    key={item._id}
                    className={`border-t border-ink-100 transition-opacity ${!item.is_available ? "opacity-50" : ""
                      }`}
                  >
                    <td className="px-4 py-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-semibold text-sm select-none"
                          style={{ backgroundColor: getAvatarColor(item.name) }}
                        >
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink-900 line-clamp-1">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-ink-50 text-ink-600 border border-ink-100">
                        {categoryMap.get(item.category_id) ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink-700 tabular-nums">
                      {formatNumber(item.price)} ກີບ
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(v) => onToggle(item, "is_available", v)}
                        disabled={availabilityPending}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={item.is_sold_out}
                        onCheckedChange={(v) => onToggle(item, "is_sold_out", v)}
                        disabled={availabilityPending || !item.is_available}
                      />
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onLoadMore}>
            ໂຫລດເພີ່ມ
          </Button>
        </div>
      )}
    </div>
  );
}
