import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MenuSidebar } from "@/components/admin/menu/MenuSidebar";
import { MenuItemTable } from "@/components/admin/menu/MenuItemTable";
import { ItemDialog } from "@/components/admin/menu/ItemDialog";
import { CategoryDialog } from "@/components/admin/menu/CategoryDialog";
import {
  useAdminMenuItems,
  useMenuCategories,
  useUpdateMenuItemAvailability,
  useDeleteMenuItem,
  useDeleteMenuCategory,
} from "@/hooks/useMenu";
import { useMenuRealtime } from "@/hooks/useMenuRealtime";
import type { MenuItem, MenuCategory } from "@/types/entities";

const PAGE_SIZE = 50;

export default function AdminMenu() {
  useMenuRealtime();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<MenuCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<MenuCategory | null>(null);

  const [pendingToggle, setPendingToggle] = useState<{
    item: MenuItem;
    field: "is_available" | "is_sold_out";
    value: boolean;
  } | null>(null);

  const { data: allItemsData, isLoading } = useAdminMenuItems();
  const { data: categories } = useMenuCategories();
  const { mutate: updateAvailability, isPending: availabilityPending } = useUpdateMenuItemAvailability();
  const { mutate: deleteItemMutate } = useDeleteMenuItem();
  const { mutate: deleteCategoryMutate } = useDeleteMenuCategory();

  const allItems = allItemsData?.data ?? [];
  const allCategories = categories ?? [];
  const categoryMap = useMemo(
    () => new Map(allCategories.map((c): [string, string] => [c._id, c.name])),
    [allCategories],
  );

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        !debouncedSearch ||
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = !selectedCategoryId || item.category_id === selectedCategoryId;
      return matchSearch && matchCat;
    });
  }, [allItems, debouncedSearch, selectedCategoryId]);

  const displayed = filtered.slice(0, displayLimit);
  const hasMore = filtered.length > displayLimit;

  function handleSearchChange(value: string) {
    setSearch(value);
    setDisplayLimit(PAGE_SIZE);
  }

  function confirmToggle(
    item: MenuItem,
    field: "is_available" | "is_sold_out",
    value: boolean,
  ) {
    setPendingToggle({ item, field, value });
  }

  function executeToggle() {
    if (!pendingToggle) return;
    const { item, field, value } = pendingToggle;
    const next = {
      is_available: field === "is_available" ? value : item.is_available,
      is_sold_out: field === "is_sold_out" ? value : item.is_sold_out,
    };
    if (field === "is_available" && !value) next.is_sold_out = false;
    updateAvailability(
      { id: item._id, ...next },
      { onError: () => toast.error("ບໍ່ສາມາດອັບເດດໄດ້ ກະລຸນາລອງໃໝ່") },
    );
    setPendingToggle(null);
  }

  function getConfirmContent() {
    if (!pendingToggle) return { title: "", description: "", variant: "default" as const };
    const { item, field, value } = pendingToggle;
    if (field === "is_available") {
      return value
        ? { title: "ເປີດ ພ້ອມຂາຍ", description: `ສິນຄ້າ "${item.name}" ຈະຖືກໝາຍວ່າ ພ້ອມຂາຍ`, variant: "default" as const }
        : { title: "ປິດ ພ້ອມຂາຍ", description: `ສິນຄ້າ "${item.name}" ຈະຖືກໝາຍວ່າ ບໍ່ພ້ອມຂາຍ`, variant: "destructive" as const };
    }
    return value
      ? { title: "ໝາຍວ່າ ໝົດ", description: `ສິນຄ້າ "${item.name}" ຈະຖືກໝາຍວ່າ ໝົດສິນຄ້າ`, variant: "destructive" as const }
      : { title: "ຍົກເລີກ ໝົດ", description: `ສິນຄ້າ "${item.name}" ຈະສາມາດສັ່ງໄດ້ອີກ`, variant: "default" as const };
  }

  const confirmContent = getConfirmContent();

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <MenuSidebar
          allCategories={allCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          totalCount={allItems.length}
          onAddCategory={() => setCreateCategoryOpen(true)}
          onEditCategory={setEditCategory}
          onDeleteCategory={setDeleteCategory}
        />

        <MenuItemTable
          isLoading={isLoading}
          displayed={displayed}
          categoryMap={categoryMap}
          availabilityPending={availabilityPending}
          search={search}
          onSearchChange={handleSearchChange}
          onSearchClear={() => handleSearchChange("")}
          onToggle={confirmToggle}
          onEdit={setEditItem}
          onDelete={setDeleteItem}
          onAddItem={() => setCreateItemOpen(true)}
          hasMore={hasMore}
          onLoadMore={() => setDisplayLimit((n) => n + PAGE_SIZE)}
        />
      </div>

      {/* Item dialogs */}
      <ItemDialog
        open={createItemOpen}
        onOpenChange={setCreateItemOpen}
        categories={allCategories}
      />
      {editItem && (
        <ItemDialog
          item={editItem}
          open={!!editItem}
          onOpenChange={(v) => { if (!v) setEditItem(null); }}
          categories={allCategories}
        />
      )}
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(v) => { if (!v) setDeleteItem(null); }}
        title="ລົບລາຍການເມນູ"
        description={`ທ່ານຕ້ອງການລົບ "${deleteItem?.name}" ອອກຈາກລະບົບຫຼືບໍ່?`}
        variant="destructive"
        confirmLabel="ລົບ"
        onConfirm={() => {
          if (deleteItem) deleteItemMutate(deleteItem._id, { onSuccess: () => setDeleteItem(null) });
        }}
      />

      {/* Category dialogs */}
      <CategoryDialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen} />
      {editCategory && (
        <CategoryDialog
          category={editCategory}
          open={!!editCategory}
          onOpenChange={(v) => { if (!v) setEditCategory(null); }}
        />
      )}
      <ConfirmDialog
        open={!!deleteCategory}
        onOpenChange={(v) => { if (!v) setDeleteCategory(null); }}
        title="ລົບໝວດໝູ່"
        description={`ທ່ານຕ້ອງການລົບໝວດໝູ່ "${deleteCategory?.name}" ອອກຈາກລະບົບຫຼືບໍ່?`}
        variant="destructive"
        confirmLabel="ລົບ"
        onConfirm={() => {
          if (deleteCategory) deleteCategoryMutate(deleteCategory._id, { onSuccess: () => setDeleteCategory(null) });
        }}
      />

      {/* Availability toggle confirm */}
      <ConfirmDialog
        open={pendingToggle !== null}
        onOpenChange={(open) => { if (!open) setPendingToggle(null); }}
        title={confirmContent.title}
        description={confirmContent.description}
        variant={confirmContent.variant}
        confirmLabel="ຢືນຢັນ"
        onConfirm={executeToggle}
      />
    </div>
  );
}
