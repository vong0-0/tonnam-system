import { useMemo, useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Column,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import UserRoleBadge from '@/components/admin/users/UserRoleBadge'
import UserStatusBadge from '@/components/admin/users/UserStatusBadge'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import type { User } from '@/types/entities'

const PAGE_SIZE = 20

interface UserTableProps {
  isLoading: boolean
  data: User[]
  onEdit: (user: User) => void
  onDeactivate: (user: User) => void
  onReactivate: (user: User) => void
}

function SortButton({ column, label }: { column: Column<User, unknown>; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-semibold text-white hover:bg-white/10 hover:text-white"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
    </Button>
  )
}

export function UserTable({
  isLoading,
  data,
  onEdit,
  onDeactivate,
  onReactivate,
}: UserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'info', desc: false }])
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    setPageIndex(0)
  }, [data])

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: 'info',
      accessorFn: (row) => row.first_name,
      header: ({ column }) => <SortButton column={column} label="ຂໍ້ມູນ" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-ink-900">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">@{row.original.username}</p>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'ເບີໂທ',
      cell: ({ row }) => (
        <span className="text-sm text-ink-700">{row.original.phone}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-ink-500">
          {row.original.email ?? '—'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'role',
      header: 'ຕຳແຫນ່ງ',
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
      enableSorting: false,
    },
    {
      id: 'status',
      header: 'ສະຖານະ',
      cell: ({ row }) => <UserStatusBadge isActive={row.original.is_active} />,
      enableSorting: false,
    },
    {
      id: 'createdAt',
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => <SortButton column={column} label="ວັນທີສ້າງ" />,
      cell: ({ row }) => (
        <span className="text-sm text-ink-700 tabular-nums">
          {formatDate(row.original.createdAt, DATE_FORMATS.DATE)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">ຈັດການ</div>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs border-ink-200 text-ink-700 hover:bg-ink-50"
              onClick={() => onEdit(user)}
            >
              ແກ້ໄຂ
            </Button>
            {user.is_active ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs border-danger/30 text-danger hover:bg-danger/5"
                onClick={() => onDeactivate(user)}
              >
                ປິດໃຊ້ງານ
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs border-green/30 text-green hover:bg-green/5"
                onClick={() => onReactivate(user)}
              >
                ເປີດໃຊ້ງານ
              </Button>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
  ], [onEdit, onDeactivate, onReactivate])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize: PAGE_SIZE } },
    onSortingChange: (updater) => {
      setSorting(updater)
      setPageIndex(0)
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function'
        ? updater({ pageIndex, pageSize: PAGE_SIZE })
        : updater
      setPageIndex(next.pageIndex)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  const pageCount = table.getPageCount()
  const currentPage = pageIndex + 1

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-lg border border-ink-100 bg-paper">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-green-light hover:bg-green-light">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-2 font-semibold text-white">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-4 py-2">
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-ink-100 hover:bg-ink-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-ink-400">
                  ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            ສະແດງ {Math.min(pageIndex * PAGE_SIZE + 1, data.length)}–
            {Math.min((pageIndex + 1) * PAGE_SIZE, data.length)} ຈາກ {data.length} ລາຍການ
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === pageCount}
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              className="h-8 w-8 border-ink-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
