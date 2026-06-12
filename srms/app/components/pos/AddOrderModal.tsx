import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Drawer } from "vaul";
import { Loader, Send, UtensilsCrossed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/common/SearchInput";
import { AppSelect, type SelectOption } from "@/components/common/AppSelect";
import { MenuItemCard } from "@/components/waiter/MenuItemCard";
import { CartEntryRow } from "@/components/waiter/CartEntryRow";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { EmptyState } from "@/components/common/EmptyState";
import { useMenuItems, useMenuCategories } from "@/hooks/useMenu";
import { useCreateOrder } from "@/hooks/useOrders";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { formatNumber } from "@/lib/utils";
import type { CartEntry, MenuCategory, MenuItem } from "@/types/entities";

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  billId: string;
  tableName: string;
}

export default function AddOrderModal({
  open,
  onOpenChange,
  billId,
  tableName,
}: AddOrderModalProps) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [sheetQty, setSheetQty] = useState(1);
  const [sheetNote, setSheetNote] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [categoryId, setCategoryId] = useState("");
  const [listRoot, setListRoot] = useState<HTMLElement | null>(null);

  const { data: categories = [] as MenuCategory[] } = useMenuCategories();
  const {
    items,
    isLoading,
    isEmpty,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMenuItems({
    search: debouncedSearch || undefined,
    category_id: categoryId || undefined,
  });
  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    root: listRoot,
  });
  const { mutate: submitOrder, isPending } = useCreateOrder();

  const totalItems = cart.reduce((s, e) => s + e.quantity, 0);
  const totalPrice = cart.reduce((s, e) => s + e.item.price * e.quantity, 0);

  function getItemCartQty(itemId: string) {
    return cart
      .filter((e) => e.item._id === itemId)
      .reduce((s, e) => s + e.quantity, 0);
  }

  function openItemSheet(item: MenuItem) {
    if (!item.is_available || item.is_sold_out) return;
    setSelectedItem(item);
    setSheetQty(1);
    setSheetNote("");
  }

  function confirmItemSheet() {
    if (!selectedItem || sheetQty === 0) return;
    const existingIdx = cart.findIndex(
      (e) => e.item._id === selectedItem._id && e.note === sheetNote,
    );
    if (existingIdx >= 0) {
      setCart((prev) =>
        prev.map((e, i) =>
          i === existingIdx ? { ...e, quantity: e.quantity + sheetQty } : e,
        ),
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          item: selectedItem,
          quantity: sheetQty,
          note: sheetNote,
        },
      ]);
    }
    setSelectedItem(null);
  }

  function updateEntryQty(entryId: string, qty: number) {
    setCart((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, quantity: qty } : e)),
    );
  }

  function removeEntry(entryId: string) {
    setCart((prev) => prev.filter((e) => e.id !== entryId));
  }

  function handleSubmit() {
    if (!billId || cart.length === 0) return;
    submitOrder(
      {
        bill_id: billId,
        items: cart.map(({ item, quantity, note }) => ({
          menu_item_id: item._id,
          quantity,
          ...(note ? { note } : {}),
        })),
      },
      {
        onSuccess: () => {
          setCart([]);
          onOpenChange(false);
        },
      },
    );
  }

  function handleClose() {
    setCart([]);
    setSearch("");
    setCategoryId("");
    onOpenChange(false);
  }

  const categoryOptions: SelectOption[] = [
    { value: "ALL", label: "ທຸກໝວດ" },
    ...categories.map((c: MenuCategory) => ({ value: c._id, label: c.name })),
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[1000px] w-screen h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="font-body font-bold text-xl">
              ສັ່ງອາຫານ — ໂຕະ {tableName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Menu list */}
            <div className="flex flex-col flex-1 overflow-hidden border-r">
              <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch("")}
                  placeholder="ຄົ້ນຫາເມນູ..."
                  className="flex-1 [&_input]:border-ink-300 [&_input]:bg-paper"
                />
                <AppSelect
                  value={categoryId || "ALL"}
                  onValueChange={(v) => setCategoryId(v === "ALL" ? "" : v)}
                  options={categoryOptions}
                  placeholder="ທຸກໝວດ"
                  triggerClassName="h-auto py-2 w-32 border-ink-300 bg-paper"
                />
              </div>

              <div
                ref={setListRoot}
                className="flex-1 overflow-y-auto px-4 py-3"
              >
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isEmpty ? (
                  <EmptyState
                    icon={UtensilsCrossed}
                    title="ບໍ່ພົບເມນູ"
                    description="ບໍ່ມີເມນູທີ່ກົງກັບການຄົ້ນຫາ"
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item._id}
                          item={item}
                          cartQty={getItemCartQty(item._id)}
                          onAdd={() => openItemSheet(item)}
                        />
                      ))}
                    </div>
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <div ref={sentinelRef} />
                  </>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="w-72 flex flex-col shrink-0">
              <div className="px-4 py-3 border-b shrink-0">
                <p className="font-bold text-base text-ink-900">
                  ລາຍການທີ່ເລືອກ
                </p>
                <p className="text-xs text-ink-500">
                  {totalItems} ລາຍການ · {formatNumber(totalPrice)} ກີບ
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2">
                {cart.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-ink-400 text-sm text-center">
                      ຍັງບໍ່ມີລາຍການ
                      <br />
                      ກົດເມນູເພື່ອເພີ່ມ
                    </p>
                  </div>
                ) : (
                  cart.map((entry) => (
                    <CartEntryRow
                      key={entry.id}
                      entry={entry}
                      onUpdateQty={updateEntryQty}
                      onRemove={removeEntry}
                    />
                  ))
                )}
              </div>

              <div className="px-4 py-4 border-t shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg text-ink-900">ລວມ</span>
                  <span className="font-bold text-xl text-teal-500">
                    {formatNumber(totalPrice)} ກີບ
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isPending || cart.length === 0}
                  className="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {isPending ? "ກຳລັງສ່ງ..." : "ສົ່ງໄປຫ້ອງຄົວ"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item detail drawer */}
      <Drawer.Root
        open={selectedItem !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedItem(null);
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
          <Drawer.Content className="max-w-[500px] mx-auto fixed bottom-0 inset-x-0 z-[70] flex flex-col rounded-t-2xl bg-paper max-h-[90vh]">
            <div className="mx-auto mt-3 mb-1 w-10 h-1 rounded-full bg-ink-100" />
            {selectedItem && (
              <div className="flex flex-col px-4 pb-6 overflow-y-auto">
                <div className="flex items-center gap-4">
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="w-20 h-20 object-cover rounded-xl mt-2 mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-ink-50 flex items-center justify-center mt-2 mb-4">
                      <UtensilsCrossed
                        size={22}
                        strokeWidth={1.5}
                        className="text-ink-200"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Drawer.Title className="text-base font-semibold text-ink-900">
                      {selectedItem.name}
                    </Drawer.Title>
                    {selectedItem.description && (
                      <p className="text-xs text-ink-500 leading-relaxed line-clamp-1">
                        {selectedItem.description}
                      </p>
                    )}
                    <p className="text-xl font-bold text-success">
                      {formatNumber(selectedItem.price)} ກີບ
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-700">
                    ຈຳນວນ
                  </label>
                  <QuantityStepper
                    size="md"
                    value={sheetQty}
                    onChange={setSheetQty}
                    min={1}
                    className="justify-center"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label
                    htmlFor="add-order-note"
                    className="text-xs font-semibold text-ink-700"
                  >
                    ໝາຍເຫດ
                  </label>
                  <textarea
                    id="add-order-note"
                    value={sheetNote}
                    onChange={(e) => setSheetNote(e.target.value)}
                    placeholder="ເຊັ່ນ: ບໍ່ເຜັດ, ບໍ່ໃສ່ຜັກ..."
                    rows={2}
                    className="w-full rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>

                <button
                  onClick={confirmItemSheet}
                  className="mt-5 w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors duration-150"
                >
                  {`ເພີ່ມເຂົ້າ · ${formatNumber(selectedItem.price * sheetQty)} ກີບ`}
                </button>
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
