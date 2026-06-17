import { useState, useRef } from 'react'
import { useDebounce } from 'use-debounce'
import toast from 'react-hot-toast'
import { ChevronRight, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SearchInput } from '@/components/common/SearchInput'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useMenuItems, useMenuCategories, useUpdateMenuItemAvailability } from '@/hooks/useMenu'
import { useMenuRealtime } from '@/hooks/useMenuRealtime'
import { formatNumber } from '@/lib/utils'
import { resolveImageUrl } from '@/lib/image'
import type { MenuItem } from '@/types/entities'

const DEFAULT_WIDTH = 220
const COLLAPSE_THRESHOLD = 120
const MAX_WIDTH = 360

const AVATAR_COLORS = ['#C45C3A', '#2D6A4F', '#6B7B3A', '#A0786E', '#2C7873', '#7B5E1A']

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export default function PosMenu() {
  useMenuRealtime()

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [isOpen, setIsOpen] = useState(true)
  const lastOpenWidth = useRef(DEFAULT_WIDTH)
  const [pendingToggle, setPendingToggle] = useState<{
    item: MenuItem
    field: 'is_available' | 'is_sold_out'
    value: boolean
  } | null>(null)

  const { data: categories } = useMenuCategories()
  const { items, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMenuItems({
    search: debouncedSearch || undefined,
    category_id: selectedCategoryId,
    limit: 50,
  })
  const { mutate: updateAvailability, isPending } = useUpdateMenuItemAvailability()

  const totalCount = categories?.reduce((s, c) => s + c.item_count, 0) ?? 0
  const categoryMap = new Map(categories?.map((c) => [c._id, c.name]) ?? [])

  function confirmToggle(item: MenuItem, field: 'is_available' | 'is_sold_out', value: boolean) {
    setPendingToggle({ item, field, value })
  }

  function executeToggle() {
    if (!pendingToggle) return
    const { item, field, value } = pendingToggle
    const next = {
      is_available: field === 'is_available' ? value : item.is_available,
      is_sold_out: field === 'is_sold_out' ? value : item.is_sold_out,
    }
    if (field === 'is_available' && !value) next.is_sold_out = false
    updateAvailability(
      { id: item._id, ...next },
      { onError: () => toast.error('ບໍ່ສາມາດອັບເດດໄດ້ ກະລຸນາລອງໃໝ່') },
    )
    setPendingToggle(null)
  }

  function getConfirmContent() {
    if (!pendingToggle) return { title: '', description: '', variant: 'default' as const }
    const { item, field, value } = pendingToggle
    if (field === 'is_available') {
      return value
        ? { title: 'ເປີດ ພ້ອມຂາຍ', description: `ສິນຄ້າ "${item.name}" ຈະຖືກໝາຍວ່າ ພ້ອມຂາຍ`, variant: 'default' as const }
        : { title: 'ປິດ ພ້ອມຂາຍ', description: `ສິນຄ້າ "${item.name}" ຈະຖືກໝາຍວ່າ ບໍ່ພ້ອມຂາຍ`, variant: 'destructive' as const }
    }
    return value
      ? { title: 'ໝາຍວ່າ ໝົດ', description: `ສິນຄ້າ "${item.name}" ຈະຖືກໝາຍວ່າ ໝົດສິນຄ້າ`, variant: 'destructive' as const }
      : { title: 'ຍົກເລີກ ໝົດ', description: `ສິນຄ້າ "${item.name}" ຈະສາມາດສັ່ງໄດ້ອີກ`, variant: 'default' as const }
  }

  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth

    function onMouseMove(ev: MouseEvent) {
      const newWidth = startWidth + (ev.clientX - startX)
      if (newWidth < COLLAPSE_THRESHOLD) {
        setIsOpen(false)
        cleanup()
        return
      }
      const clamped = Math.min(MAX_WIDTH, Math.max(COLLAPSE_THRESHOLD, newWidth))
      setSidebarWidth(clamped)
      lastOpenWidth.current = clamped
    }

    function onMouseUp() {
      cleanup()
    }

    function cleanup() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function openSidebar() {
    setIsOpen(true)
    setSidebarWidth(lastOpenWidth.current)
  }

  return (
    <div className="space-y-4">

      <div className="flex items-start">
        {isOpen ? (
          <div
            className=" relative flex-shrink-0 self-start sticky top-0 bg-paper border border-ink-100 overflow-hidden"
            style={{ width: sidebarWidth }}
          >
            <div className='flex items-center justify-between px-4 py-2 border-b'>
              <p>ໝວດໝູ່</p>
              <Button variant='ghost' size='icon' className='w-6 h-6 rounded-full' onClick={() => setIsOpen(false)}>
                <X />
              </Button>
            </div>
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
              <button
                onClick={() => setSelectedCategoryId(undefined)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedCategoryId === undefined
                  ? 'border-l-2 border-green bg-ink-50 font-semibold text-ink-900'
                  : 'border-l-2 border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50'
                  }`}
              >
                <span className="truncate block">
                  ທັງໝົດ <span className="text-ink-400 font-normal">({totalCount})</span>
                </span>
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategoryId(cat._id)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedCategoryId === cat._id
                    ? 'border-l-2 border-green bg-ink-50 font-semibold text-ink-900'
                    : 'border-l-2 border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50'
                    }`}
                >
                  <span className="truncate block">
                    {cat.name} <span className="text-ink-400 font-normal">({cat.item_count})</span>
                  </span>
                </button>
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

        <div className="flex-1 min-w-0 pl-4">
          <div className="mb-4">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="ຄົ້ນຫາເມນູ..."
              className="w-64 bg-white"
            />
          </div>

          <div className="bg-paper rounded-xl border border-ink-100 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ink-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-16">ຮູບ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">ຊື່ເມນູ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-36">ໝວດໝູ່</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider w-28">ລາຄາ</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-ink-500 uppercase tracking-wider w-24">ພ້ອມຂາຍ</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-ink-500 uppercase tracking-wider w-20">ໝົດ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
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
                    </tr>
                  ))
                  : items.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center text-ink-500 text-sm">
                          ບໍ່ພົບລາຍການ
                        </td>
                      </tr>
                    )
                    : items.map((item) => (
                      <tr
                        key={item._id}
                        className={`border-t border-ink-100 transition-opacity ${!item.is_available ? 'opacity-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          {resolveImageUrl(item.image_url) ? (
                            <img
                              src={resolveImageUrl(item.image_url)!}
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
                          <p className="text-sm font-medium text-ink-900 line-clamp-1">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-ink-50 text-ink-600 border border-ink-100">
                            {categoryMap.get(item.category_id) ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-ink-700 tabular-nums">
                          {formatNumber(item.price)} ກີບ
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={(v) => confirmToggle(item, 'is_available', v)}
                            disabled={isPending}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch
                            checked={item.is_sold_out}
                            onCheckedChange={(v) => confirmToggle(item, 'is_sold_out', v)}
                            disabled={isPending || !item.is_available}
                          />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'ກຳລັງໂຫລດ...' : 'ໂຫລດເພີ່ມ'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingToggle !== null}
        onOpenChange={(open) => { if (!open) setPendingToggle(null) }}
        title={getConfirmContent().title}
        description={getConfirmContent().description}
        variant={getConfirmContent().variant}
        confirmLabel="ຢືນຢັນ"
        onConfirm={executeToggle}
      />
    </div>
  )
}
