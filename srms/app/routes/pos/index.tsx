import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import PosFilterBar from '@/components/pos/PosFilterBar'
import CreateTableModal from '@/components/pos/CreateTableModal'
import PosTableCard from '@/components/pos/PosTableCard'
import { useTables } from '@/hooks/useTables'
import type { TableStatus } from '@/types/enums'

export default function PosIndex() {
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [isTemporary, setIsTemporary] = useState(false)
  const [debouncedSearch] = useDebounce(search, 300)

  const { tables, isLoading } = useTables({
    search: debouncedSearch || undefined,
    status: status as TableStatus | 'ALL',
    is_temporary: isTemporary || undefined,
  })

  return (
    <div className="space-y-6">
      <PosFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        isTemporary={isTemporary}
        onIsTemporaryChange={setIsTemporary}
        onCreateTable={() => setCreateOpen(true)}
      />
      {isLoading ? (
        <p className="text-sm text-ink-500">ກຳລັງໂຫລດ...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4">
          {tables.map(table => (
            <PosTableCard key={table._id} table={table} />
          ))}
        </div>
      )}
      <CreateTableModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
