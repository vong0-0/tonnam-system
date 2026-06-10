import { ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

export default function KitchenOrderHistoryPage() {
  return (
    <EmptyState
      icon={ClipboardList}
      title="ກຳລັງພັດທະນາ"
      description="ໜ້ານີ້ຍັງຢູ່ໃນລະຫວ່າງການພັດທະນາ"
    />
  )
}
