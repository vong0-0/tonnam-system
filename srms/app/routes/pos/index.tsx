import { useState } from 'react'
import PosFilterBar from '@/components/pos/PosFilterBar'
import CreateTableModal from '@/components/pos/CreateTableModal'

export default function PosIndex() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div>
      <PosFilterBar onCreateTable={() => setCreateOpen(true)} />
      <CreateTableModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
