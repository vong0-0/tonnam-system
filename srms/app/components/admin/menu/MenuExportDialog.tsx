import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { exportMasterDataExcel, type MasterDataSheet } from "@/lib/master-data-excel";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import type { MenuCategory, MenuItem } from "@/types/entities";

type ExportTarget = "menus" | "categories" | "both";
type CategoryScope = "all" | "selected";

interface MenuExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MenuItem[];
  categories: MenuCategory[];
  categoryMap: Map<string, string>;
  selectedCategoryId?: string;
}

function formatDateTime(value: string): string {
  try {
    return formatDate(value, DATE_FORMATS.DATE_TIME);
  } catch {
    return "?";
  }
}

export function MenuExportDialog({
  open,
  onOpenChange,
  items,
  categories,
  categoryMap,
  selectedCategoryId,
}: MenuExportDialogProps) {
  const [target, setTarget] = useState<ExportTarget>("both");
  const [categoryScope, setCategoryScope] = useState<CategoryScope>("all");
  const [isExporting, setIsExporting] = useState(false);
  const selectedCategory = categories.find((category) => category._id === selectedCategoryId);

  useEffect(() => {
    if (!selectedCategoryId) setCategoryScope("all");
  }, [selectedCategoryId]);

  function menuSheet(): MasterDataSheet {
    return {
      name: "Menus",
      title: "ລາຍການເມນູອາຫານ / Menu items",
      headers: [
        "ຊື່ເມນູ / Menu",
        "ໝວດໝູ່ / Category",
        "ຄຳອະທິບາຍ / Description",
        "ລາຄາ / Price (LAK)",
        "ເປີດຂາຍ / Available",
        "ໝົດແລ້ວ / Sold out",
      ],
      rows: items.map((item) => [
        item.name,
        categoryMap.get(item.category_id) ?? "?",
        item.description ?? "ບໍ່ມີຄຳອະທິບາຍ",
        item.price,
        item.is_available ? "ເປີດຂາຍ" : "ບໍ່ເປີດຂາຍ",
        item.is_sold_out ? "ໝົດແລ້ວ" : "ຍັງມີຂາຍ",
      ]),
      columnWidths: [30, 24, 38, 20, 18, 16, 22, 22],
      currencyColumns: [4],
    };
  }

  function categorySheet(): MasterDataSheet {
    const categoriesToExport = categoryScope === "selected" && selectedCategory
      ? [selectedCategory]
      : categories;

    return {
      name: "Categories",
      title: "ໝວດໝູ່ເມນູ / Menu categories",
      headers: [
        "ໝວດໝູ່ / Category",
        "ຄຳອະທິບາຍ / Description",
        "ຈຳນວນລາຍການ / Item count",
      ],
      rows: categoriesToExport.map((category) => [
        category.name,
        category.description ?? "ບໍ່ມີຄຳອະທິບາຍ",
        category.item_count,
      ]),
      columnWidths: [30, 40, 20, 22, 22],
    };
  }

  async function handleExport() {
    const sheets: MasterDataSheet[] = [];
    if (target === "menus" || target === "both") sheets.push(menuSheet());
    if (target === "categories" || target === "both") sheets.push(categorySheet());

    const date = formatDate(new Date(), DATE_FORMATS.DATE_ISO);
    const fileBase = target === "menus" ? "Menus" : target === "categories" ? "Menu_Categories" : "Menu_and_Categories";
    setIsExporting(true);
    try {
      await exportMasterDataExcel("TonNam_" + fileBase + "_" + date + ".xlsx", sheets);
      toast.success("Excel report downloaded successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to export menu data", error);
      toast.error("Unable to export the Excel report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,34rem)]">
        <DialogHeader>
          <DialogTitle>Export Excel</DialogTitle>
          <DialogDescription>ເລືອກຂໍ້ມູນທີ່ຕ້ອງການລວມໃສ່ໃນໄຟລ໌ Excel.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">ຂໍ້ມູນທີ່ຕ້ອງການສົ່ງອອກ</p>
            <RadioGroup value={target} onValueChange={(value) => setTarget(value as ExportTarget)}>
              {[
                ["menus", "ເມນູອາຫານ"],
                ["categories", "ໝວດໝູ່ເມນູ"],
                ["both", "ເມນູອາຫານ ແລະ ໝວດໝູ່ເມນູ"],
              ].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50">
                  <RadioGroupItem value={value} />
                  {label}
                </label>
              ))}
            </RadioGroup>
          </div>

          {target !== "menus" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">ຂອບເຂດໝວດໝູ່ເມນູ</p>
              <RadioGroup value={categoryScope} onValueChange={(value) => setCategoryScope(value as CategoryScope)}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50">
                  <RadioGroupItem value="all" />
                  ທັງໝົດ
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2 text-sm has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50">
                  <RadioGroupItem value="selected" disabled={!selectedCategory} />
                  ທີ່ເລືອກ{selectedCategory ? ": " + selectedCategory.name : " (ເລືອກໝວດໝູ່ກ່ອນ)"}
                </label>
              </RadioGroup>
            </div>
          )}
        </div>
        <DialogFooter className="border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>Cancel</Button>
          <ExportExcelButton onClick={handleExport} isExporting={isExporting} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
