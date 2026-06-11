import { SearchInput } from '@/components/common/SearchInput'
import { AppSelect, type SelectOption } from '@/components/common/AppSelect'
import { OrderStatus } from '@/types/enums'

const statusOptions: SelectOption[] = [
  { value: 'ALL',                       label: 'ທຸກສະຖານະ' },
  { value: OrderStatus.SENT_TO_KITCHEN, label: 'ລໍຖ້າ' },
  { value: OrderStatus.COOKED,          label: 'ສຳເລັດ' },
  { value: OrderStatus.CANCELLED,       label: 'ຍົກເລີກ' },
]

interface KitchenFilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
}

export default function KitchenFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: KitchenFilterBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <SearchInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        placeholder="ຄົ້ນຫາ order..."
        className="flex-1"
      />
      <AppSelect
        value={status}
        onValueChange={onStatusChange}
        options={statusOptions}
        placeholder="ທຸກສະຖານະ"
        triggerClassName="h-auto py-2 w-32"
      />
    </div>
  )
}
