import { Plus } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { Button } from '@/components/ui/button'
import { TableStatus } from '@/types/enums'

const statusOptions: SelectOption[] = [
  { value: 'ALL', label: 'ທຸກສະຖານະ' },
  { value: TableStatus.AVAILABLE, label: 'ວ່າງ' },
  { value: TableStatus.RESERVED, label: 'ຈອງແລ້ວ' },
  { value: TableStatus.OCCUPIED, label: 'ມີລູກຄ່າ' },
  { value: TableStatus.PAID, label: 'ຊຳລະແລ້ວ' },
]

interface PosFilterBarProps {
  onCreateTable?: () => void
}

export default function PosFilterBar({ onCreateTable }: PosFilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <SearchInput
        placeholder="ຄົ້ນຫາໂຕະ..."
        className="flex-1 [&_input]:border-ink-300 [&_input]:bg-paper"
      />
      <AppSelect
        options={statusOptions}
        placeholder="ທຸກສະຖານະ"
        triggerClassName="w-36 h-auto py-2 border-ink-300 bg-paper"
      />
      <Button size="sm" className="gap-1.5 shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600" onClick={onCreateTable}>
        <Plus size={16} />
        ເພີ່ມໂຕະ
      </Button>
    </div>
  )
}
