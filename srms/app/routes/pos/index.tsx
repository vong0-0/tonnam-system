import { useState } from 'react'
import PosFilterBar from '@/components/pos/PosFilterBar'
import CreateTableModal from '@/components/pos/CreateTableModal'
import PosTableCard from '@/components/pos/PosTableCard'
import { useTables } from '@/hooks/useTables'

export default function PosIndex() {
  const [createOpen, setCreateOpen] = useState(false)
  const { tables, isLoading } = useTables()

  return (
    <div className="space-y-6">
      <PosFilterBar onCreateTable={() => setCreateOpen(true)} />
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
