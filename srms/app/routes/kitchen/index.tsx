import { UtensilsCrossed } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

export default function KitchenIndexPage() {
  return (
    <EmptyState
      icon={UtensilsCrossed}
      title="ກຳລັງພັດທະນາ"
      description="ໜ້ານີ້ຍັງຢູ່ໃນລະຫວ່າງການພັດທະນາ"
    />
  )
}
