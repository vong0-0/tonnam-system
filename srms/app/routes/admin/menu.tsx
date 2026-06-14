import { useState, useMemo, useRef } from "react";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import { ChevronRight, X, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import {
  useAdminMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useMenuCategories,
  useUpdateMenuItemAvailability,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
} from "@/hooks/useMenu";
import { useMenuRealtime } from "@/hooks/useMenuRealtime";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  createMenuCategorySchema,
  updateMenuCategorySchema,
} from "@/schemas/menu.schema";
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "@/schemas/menu.schema";
import { formatNumber } from "@/lib/utils";
import type { MenuItem, MenuCategory } from "@/types/entities";

const DEFAULT_WIDTH = 220;
const COLLAPSE_THRESHOLD = 120;
const MAX_WIDTH = 360;
const PAGE_SIZE = 50;

const AVATAR_COLORS = ["#C45C3A", "#2D6A4F", "#6B7B3A", "#A0786E", "#2C7873", "#7B5E1A"];
function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Item Dialog ─────────────────────────────────────────────────────────────

function ItemDialog({
  item,
  open,
  onOpenChange,
  categories,
}: {
  item?: MenuItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: MenuCategory[];
}) {
  const isEdit = !!item;
  const { mutate: create, isPending: creating } = useCreateMenuItem();
  const { mutate: update, isPending: updating } = useUpdateMenuItem();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm(isEdit ? updateMenuItemSchema : createMenuItemSchema, {
    defaultValues: item
      ? {
          category_id: item.category_id,
          name: item.name,
          price: item.price,
          description: item.description ?? "",
          image_url: item.image_url ?? "",
        }
      : {
          category_id: "",
          name: "",
          price: undefined as unknown as number,
          description: "",
          image_url: "",
        },
  });

  const selectedCategoryId = watch("category_id");

  const onSubmit: SubmitHandler<CreateMenuItemInput | UpdateMenuItemInput> = (values) => {
    const clean = {
      ...values,
      description: values.description || undefined,
      image_url: values.image_url || undefined,
    };
    if (isEdit && item) {
      update({ id: item._id, ...clean }, { onSuccess: () => { onOpenChange(false); reset(); } });
    } else {
      create(clean as CreateMenuItemInput, { onSuccess: () => { onOpenChange(false); reset(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink-900">
            {isEdit ? "ແກ້ໄຂເມນູ" : "ເພີ່ມເມນູໃໝ່"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            {isEdit ? "ແກ້ໄຂຂໍ້ມູນລາຍການເມນູ" : "ເພີ່ມລາຍການເມນູໃໝ່ເຂົ້າສູ່ລະບົບ"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 p-4 pt-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ໝວດໝູ່ <span className="text-danger">*</span>
            </label>
            <Select
              value={selectedCategoryId}
              onValueChange={(v) => setValue("category_id", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-ink-300 bg-paper">
                <SelectValue placeholder="ເລືອກໝວດໝູ່" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-xs text-danger">{errors.category_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຊື່ເມນູ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("name")}
                placeholder="ເຊັ່ນ: ຂ້າວຜັດ"
                className="border-ink-300 bg-paper"
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ລາຄາ (ກີບ) <span className="text-danger">*</span>
              </label>
              <Input
                {...register("price")}
                type="number"
                min={0}
                placeholder="35000"
                className="border-ink-300 bg-paper"
              />
              {errors.price && (
                <p className="text-xs text-danger">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">ລາຍລະອຽດ</label>
            <Input
              {...register("description")}
              placeholder="ລາຍລະອຽດເມນູ (ບໍ່ບັງຄັບ)"
              className="border-ink-300 bg-paper"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">URL ຮູບພາບ</label>
            <Input
              {...register("image_url")}
              placeholder="https://..."
              className="border-ink-300 bg-paper"
            />
            {errors.image_url && (
              <p className="text-xs text-danger">{errors.image_url.message}</p>
            )}
          </div>

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
              {isPending ? "ກຳລັງບັນທຶກ..." : isEdit ? "ບັນທຶກ" : "ເພີ່ມເມນູ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category Dialog ──────────────────────────────────────────────────────────

function CategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category?: MenuCategory;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const isEdit = !!category;
  const { mutate: create, isPending: creating } = useCreateMenuCategory();
  const { mutate: update, isPending: updating } = useUpdateMenuCategory();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(isEdit ? updateMenuCategorySchema : createMenuCategorySchema, {
    defaultValues: { name: category?.name ?? "" },
  });

  const onSubmit: SubmitHandler<CreateMenuCategoryInput | UpdateMenuCategoryInput> = (values) => {
    if (isEdit && category) {
      update({ id: category._id, ...values }, { onSuccess: () => { onOpenChange(false); reset(); } });
    } else {
      create(values as CreateMenuCategoryInput, { onSuccess: () => { onOpenChange(false); reset(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink-900">
            {isEdit ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່ໃໝ່"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            {isEdit ? "ແກ້ໄຂຊື່ໝວດໝູ່ເມນູ" : "ເພີ່ມໝວດໝູ່ເມນູໃໝ່"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 p-4 pt-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ຊື່ໝວດໝູ່ <span className="text-danger">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="ເຊັ່ນ: ອາຫານຈານຫຼັກ"
              className="border-ink-300 bg-paper"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
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
              {isPending ? "ກຳລັງບັນທຶກ..." : isEdit ? "ບັນທຶກ" : "ເພີ່ມໝວດໝູ່"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMenu() {
  useMenuRealtime();

  // Sidebar
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isOpen, setIsOpen] = useState(true);
  const lastOpenWidth = useRef(DEFAULT_WIDTH);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  // Search + pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Item CRUD state
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  // Category CRUD state
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<MenuCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<MenuCategory | null>(null);

  // Availability toggle confirm
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
    () => new Map(allCategories.map((c) => [c._id, c.name])),
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
  const totalCount = allItems.length;

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

  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    function onMouseMove(ev: MouseEvent) {
      const newWidth = startWidth + (ev.clientX - startX);
      if (newWidth < COLLAPSE_THRESHOLD) {
        setIsOpen(false);
        cleanup();
        return;
      }
      const clamped = Math.min(MAX_WIDTH, Math.max(COLLAPSE_THRESHOLD, newWidth));
      setSidebarWidth(clamped);
      lastOpenWidth.current = clamped;
    }
    function onMouseUp() { cleanup(); }
    function cleanup() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function openSidebar() {
    setIsOpen(true);
    setSidebarWidth(lastOpenWidth.current);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        {/* ─── Sidebar ─── */}
        {isOpen ? (
          <div
            className="relative flex-shrink-0 self-start sticky top-0 bg-paper border border-ink-100 overflow-hidden"
            style={{ width: sidebarWidth }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <p className="text-sm font-medium">ໝວດໝູ່</p>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  title="ເພີ່ມໝວດໝູ່"
                  onClick={() => setCreateCategoryOpen(true)}
                >
                  <Plus size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
              <button
                onClick={() => setSelectedCategoryId(undefined)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedCategoryId === undefined
                    ? "border-l-2 border-green bg-ink-50 font-semibold text-ink-900"
                    : "border-l-2 border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50"
                }`}
              >
                <span className="truncate block">
                  ທັງໝົດ{" "}
                  <span className="text-ink-400 font-normal">({totalCount})</span>
                </span>
              </button>

              {allCategories.map((cat) => (
                <div key={cat._id} className="group relative">
                  <button
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className={`w-full text-left px-4 py-2 pr-16 text-sm transition-colors ${
                      selectedCategoryId === cat._id
                        ? "border-l-2 border-green bg-ink-50 font-semibold text-ink-900"
                        : "border-l-2 border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50"
                    }`}
                  >
                    <span className="truncate block">
                      {cat.name}{" "}
                      <span className="text-ink-400 font-normal">({cat.item_count})</span>
                    </span>
                  </button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditCategory(cat); }}
                      className="p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                      title="ແກ້ໄຂ"
                    >
                      <Pencil size={11} />
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (cat.item_count === 0) setDeleteCategory(cat);
                              }}
                              disabled={cat.item_count > 0}
                              className="p-1 rounded text-ink-400 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="ລຶບ"
                            >
                              <Trash2 size={11} />
                            </button>
                          </span>
                        </TooltipTrigger>
                        {cat.item_count > 0 && (
                          <TooltipContent side="right">
                            <p className="text-xs">ຍັງມີ {cat.item_count} ລາຍການຢູ່</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 hover:bg-ink-100"
              onMouseDown={handleDragStart}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 self-start sticky top-0 bg-paper border border-ink-100 rounded-xl flex items-center justify-center">
            <button
              onClick={openSidebar}
              className="w-8 h-8 text-ink-400 rounded-full flex justify-center items-center hover:text-ink-700 transition-colors"
              title="ເປີດໝວດໝູ່"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── Main content ─── */}
        <div className="flex-1 min-w-0 pl-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <SearchInput
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDisplayLimit(PAGE_SIZE); }}
              onClear={() => { setSearch(""); setDisplayLimit(PAGE_SIZE); }}
              placeholder="ຄົ້ນຫາເມນູ..."
              className="w-64 bg-white"
            />
            <Button
              className="gap-1.5 flex-shrink-0 bg-green hover:bg-green-light text-white"
              onClick={() => setCreateItemOpen(true)}
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
                        className={`border-t border-ink-100 transition-opacity ${
                          !item.is_available ? "opacity-50" : ""
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
                            onCheckedChange={(v) => confirmToggle(item, "is_available", v)}
                            disabled={availabilityPending}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch
                            checked={item.is_sold_out}
                            onCheckedChange={(v) => confirmToggle(item, "is_sold_out", v)}
                            disabled={availabilityPending || !item.is_available}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-ink-200 text-ink-700 hover:bg-ink-50"
                              onClick={() => setEditItem(item)}
                            >
                              ແກ້ໄຂ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-danger/30 text-danger hover:bg-danger/5"
                              onClick={() => setDeleteItem(item)}
                            >
                              ລຶບ
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
              <Button
                variant="outline"
                onClick={() => setDisplayLimit((n) => n + PAGE_SIZE)}
              >
                ໂຫລດເພີ່ມ
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Dialogs ─── */}
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
        title="ລຶບລາຍການເມນູ"
        description={`ທ່ານຕ້ອງການລຶບ "${deleteItem?.name}" ອອກຈາກລະບົບຫຼືບໍ່?`}
        variant="destructive"
        confirmLabel="ລຶບ"
        onConfirm={() => {
          if (deleteItem) {
            deleteItemMutate(deleteItem._id, { onSuccess: () => setDeleteItem(null) });
          }
        }}
      />

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
        title="ລຶບໝວດໝູ່"
        description={`ທ່ານຕ້ອງການລຶບໝວດໝູ່ "${deleteCategory?.name}" ອອກຈາກລະບົບຫຼືບໍ່?`}
        variant="destructive"
        confirmLabel="ລຶບ"
        onConfirm={() => {
          if (deleteCategory) {
            deleteCategoryMutate(deleteCategory._id, { onSuccess: () => setDeleteCategory(null) });
          }
        }}
      />

      <ConfirmDialog
        open={pendingToggle !== null}
        onOpenChange={(open) => { if (!open) setPendingToggle(null); }}
        title={getConfirmContent().title}
        description={getConfirmContent().description}
        variant={getConfirmContent().variant}
        confirmLabel="ຢືນຢັນ"
        onConfirm={executeToggle}
      />
    </div>
  );
}
