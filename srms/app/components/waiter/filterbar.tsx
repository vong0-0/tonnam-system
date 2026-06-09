import { SearchInput } from '@/components/common/SearchInput'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { TableStatus } from '@/types/enums'

const statusOptions: SelectOption[] = [
  { value: 'ALL', label: 'ທຸກສະຖານະ' },
  { value: TableStatus.AVAILABLE, label: 'ວ່າງ' },
  { value: TableStatus.OCCUPIED, label: 'ມີລູກຄ້າ' },
  { value: TableStatus.RESERVED, label: 'ຈອງ' },
  { value: TableStatus.PAID, label: 'ຊຳລະເງິນແລ້ວ' },
]

interface FilterbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
}

export default function Filterbar({ search, onSearchChange, status, onStatusChange }: FilterbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <SearchInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        placeholder="ຄົ້ນຫາໂຕະ..."
        className="flex-1"
      />
      <AppSelect
        value={status}
        onValueChange={onStatusChange}
        options={statusOptions}
        placeholder='ເລືອກສະຖານະໂຕະ'
        triggerClassName="h-auto py-2 w-32"
      />
    </div>
  )
}
