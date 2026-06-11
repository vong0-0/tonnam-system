import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDebounce } from 'use-debounce'
import { ChevronLeft, Loader, UtensilsCrossed } from 'lucide-react'
import { Drawer } from 'vaul'
import { useTable } from '@/hooks/useTables'
import { useMenuItems, useMenuCategories } from '@/hooks/useMenu'
import { useCreateOrder } from '@/hooks/useOrders'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchInput } from '@/components/common/SearchInput'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { QuantityStepper } from '@/components/common/QuantityStepper'
import { MenuItemCard } from '@/components/waiter/MenuItemCard'
import { CartBar } from '@/components/waiter/CartBar'
import { CartEntryRow } from '@/components/waiter/CartEntryRow'
import { formatNumber } from '@/lib/utils'
import type { MenuItem, MenuCategory, CartEntry } from '@/types/entities'

export default function WaiterOrderNew() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()

  const { data: table, isLoading: isTableLoading } = useTable(tableId ?? '')
  const billId = table?.bill_ids?.[0] ?? null

  const [cart, setCart] = useState<CartEntry[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [sheetQty, setSheetQty] = useState(1)
  const [sheetNote, setSheetNote] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [categoryId, setCategoryId] = useState<string>('')

  const { data: categories = [] as MenuCategory[] } = useMenuCategories()
  const {
    items,
    isLoading: isItemsLoading,
    isEmpty,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMenuItems({ search: debouncedSearch, category_id: categoryId || undefined })
  const sentinelRef = useInfiniteScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })
  const { mutate: submitOrder, isPending } = useCreateOrder()

  const totalItems = cart.reduce((s, e) => s + e.quantity, 0)
  const totalPrice = cart.reduce((s, e) => s + e.item.price * e.quantity, 0)

  function getItemCartQty(itemId: string) {
    return cart.filter((e) => e.item._id === itemId).reduce((s, e) => s + e.quantity, 0)
  }

  function openNewItemSheet(item: MenuItem) {
    setSelectedItem(item)
    setEditingEntryId(null)
    setSheetQty(1)
    setSheetNote('')
  }

  function confirmItemSheet() {
    if (!selectedItem) return

    if (editingEntryId) {
      if (sheetQty === 0) {
        setCart((prev) => prev.filter((e) => e.id !== editingEntryId))
      } else {
        setCart((prev) =>
          prev.map((e) =>
            e.id === editingEntryId ? { ...e, quantity: sheetQty, note: sheetNote } : e,
          ),
        )
      }
    } else {
      const existingIdx = cart.findIndex(
        (e) => e.item._id === selectedItem._id && e.note === sheetNote,
      )
      if (existingIdx >= 0) {
        setCart((prev) =>
          prev.map((e, i) => (i === existingIdx ? { ...e, quantity: e.quantity + sheetQty } : e)),
        )
      } else if (sheetQty > 0) {
        setCart((prev) => [
          ...prev,
          { id: crypto.randomUUID(), item: selectedItem, quantity: sheetQty, note: sheetNote },
        ])
      }
    }

    setSelectedItem(null)
    setEditingEntryId(null)
  }

  function updateEntryQty(entryId: string, qty: number) {
    setCart((prev) => prev.map((e) => (e.id === entryId ? { ...e, quantity: qty } : e)))
  }

  function removeEntry(entryId: string) {
    setCart((prev) => prev.filter((e) => e.id !== entryId))
  }

  function handleSubmit() {
    if (!billId || cart.length === 0) return
    submitOrder(
      {
        bill_id: billId,
        items: cart.map(({ item, quantity, note }) => ({
          menu_item_id: item._id,
          quantity,
          ...(note ? { note } : {}),
        })),
      },
      { onSuccess: () => navigate(-1) },
    )
  }

  const categoryOptions: SelectOption[] = [
    { value: 'ALL', label: 'ທຸກໝວດ' },
    ...categories.map((c: MenuCategory) => ({ value: c._id, label: c.name })),
  ]

  if (isTableLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-400">
        <Loader size={20} className="animate-spin" />
      </div>
    )
  }

  if (!billId) {
    return (
      <div className="flex flex-col h-full px-4">
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors duration-150"
            aria-label="ກັບໄປ"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <EmptyState
          icon={UtensilsCrossed}
          title="ຍັງບໍ່ມີບິນທີ່ເປີດ"
          description="ກະລຸນາເປີດບິນກ່ອນ ຈຶ່ງຈະສາມາດສັ່ງເມນູໄດ້"
          action={
            <button
              onClick={() => navigate(-1)}
              className="h-10 px-5 rounded-xl bg-green text-white text-sm font-semibold hover:bg-green-light transition-colors duration-150"
            >
              ກັບໄປໜ້າໂຕະ
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-ink-100 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors duration-150"
          aria-label="ກັບໄປ"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-base font-semibold text-ink-900 leading-tight">ສັ່ງເມນູ</p>
          {table && <p className="text-xs text-ink-500">{table.table_name}</p>}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="ຄົ້ນຫາເມນູ..."
          className="flex-1"
        />
        <AppSelect
          value={categoryId || 'ALL'}
          onValueChange={(v) => setCategoryId(v === 'ALL' ? '' : v)}
          options={categoryOptions}
          placeholder="ທຸກໝວດ"
          triggerClassName="h-auto py-2 w-28"
        />
      </div>

      {/* Menu list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {isItemsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="ບໍ່ພົບເມນູ"
            description="ບໍ່ມີເມນູທີ່ກົງກັບການຄົ້ນຫາ ລອງປ່ຽນຕົວກອງໃໝ່"
          />
        ) : (
          <>
            <div className="space-y-2 py-2">
              {items.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  cartQty={getItemCartQty(item._id)}
                  onAdd={() => openNewItemSheet(item)}
                />
              ))}
            </div>

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div ref={sentinelRef} />
          </>
        )}
      </div>

      {/* Cart bar */}
      {totalItems > 0 && (
        <CartBar
          totalItems={totalItems}
          totalPrice={totalPrice}
          onClick={() => setCartOpen(true)}
        />
      )}

      {/* Item detail drawer */}
      <Drawer.Root
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-20" />
          <Drawer.Content className="max-w-[500px] mx-auto fixed bottom-0 inset-x-0 z-30 flex flex-col rounded-t-2xl bg-paper max-h-[90vh]">
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
                      <UtensilsCrossed size={22} strokeWidth={1.5} className="text-ink-200" />
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
                  <label className="text-xs font-semibold text-ink-700">ຈຳນວນ</label>
                  <QuantityStepper
                    size="md"
                    value={sheetQty}
                    onChange={setSheetQty}
                    min={editingEntryId ? 0 : 1}
                    className="justify-center"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="note" className="text-xs font-semibold text-ink-700">
                    ໝາຍເຫດ
                  </label>
                  <textarea
                    id="note"
                    value={sheetNote}
                    onChange={(e) => setSheetNote(e.target.value)}
                    placeholder="ເຊັ່ນ: ບໍ່ເຜັດ, ບໍ່ໃສ່ຜັກ..."
                    rows={2}
                    className="w-full rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 resize-none focus:outline-none focus:border-green focus:ring-1 focus:ring-green transition-colors"
                  />
                </div>

                <button
                  onClick={confirmItemSheet}
                  className={`mt-5 w-full h-12 rounded-xl text-white text-sm font-semibold transition-colors duration-150 ${
                    sheetQty === 0 && editingEntryId
                      ? 'bg-danger hover:opacity-90'
                      : 'bg-success hover:bg-green-light'
                  }`}
                >
                  {sheetQty === 0 && editingEntryId
                    ? 'ລົບອອກ'
                    : editingEntryId
                      ? `ອັບເດດ · ${formatNumber(selectedItem.price * sheetQty)} ກີບ`
                      : `ເພີ່ມເຂົ້າ · ${formatNumber(selectedItem.price * sheetQty)} ກີບ`}
                </button>
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Cart review drawer */}
      <Drawer.Root open={cartOpen} onOpenChange={setCartOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-20" />
          <Drawer.Content className="max-w-[500px] px-6 mx-auto fixed bottom-0 inset-x-0 z-30 flex flex-col rounded-t-2xl bg-paper max-h-[90vh]">
            <div className="mx-auto mt-3 mb-1 w-10 h-1 rounded-full bg-ink-100" />

            <div className="pb-2 pt-1 shrink-0">
              <Drawer.Title className="text-base font-semibold text-ink-900">
                ກວດສອບລາຍການອາຫານ
              </Drawer.Title>
            </div>

            <div className="flex-1 overflow-y-auto pb-2">
              {cart.map((entry) => (
                <CartEntryRow
                  key={entry.id}
                  entry={entry}
                  onUpdateQty={updateEntryQty}
                  onRemove={removeEntry}
                />
              ))}
            </div>

            <div
              className="border-t pt-4 border-ink-100 shrink-0 space-y-1"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                <span>ຈຳນວນລາຍການ</span>
                <span className="font-bold text-base text-black">{totalItems} ລາຍການ</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-black font-bold text-lg">ລວມທັງໝົດ:</span>
                <span className="font-bold text-success text-xl">
                  {formatNumber(totalPrice)} ກີບ
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isPending || cart.length === 0}
                className="w-full h-12 rounded-xl bg-success hover:bg-green-light active:bg-green transition-colors duration-150 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    ກຳລັງສ່ງ...
                  </>
                ) : (
                  'ສົ່ງໄປຫ້ອງຄົວ'
                )}
              </button>

              <button
                onClick={() => setCartOpen(false)}
                className="w-full h-10 rounded-xl border border-ink-100 text-ink-700 text-sm font-semibold hover:bg-ink-50 transition-colors duration-150"
              >
                ເພີ່ມເມນູ
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
