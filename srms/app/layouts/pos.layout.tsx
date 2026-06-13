import { Outlet } from 'react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar, { type SidebarNavGroup } from '@/components/common/app-sidebar'
import AppHeader from '@/components/common/AppHeader'
import { ROUTES } from '@/constants/routes'
import { LayoutGrid, CalendarCheck, Receipt, ChartBar, UtensilsCrossed, UserRound } from 'lucide-react'

const POS_NAV: SidebarNavGroup[] = [
  {
    items: [
      { label: 'ຈັດການໂຕະ', href: ROUTES.POS, icon: LayoutGrid, end: true },
      { label: 'ປະຫວັດບິນ', href: ROUTES.POS_BILLS, icon: Receipt },
      { label: 'ສະຫຼຸບຍອດຂາຍ', href: ROUTES.POS_SUMMARY, icon: ChartBar },
      { label: 'ຈອງໂຕະ', href: ROUTES.POS_RESERVATIONS, icon: CalendarCheck },
      { label: 'ຈັດການເມນູ', href: ROUTES.POS_MENU, icon: UtensilsCrossed },
      { label: 'ໂປຣໄຟລ໌', href: ROUTES.POS_PROFILE, icon: UserRound },
    ],
  },
]

export default function PosLayout() {
  return (
    <SidebarProvider>
      <AppSidebar navGroups={POS_NAV} profileHref={ROUTES.POS_PROFILE} />
      <SidebarInset className="bg-ink-50">
        <AppHeader navGroups={POS_NAV} />
        <div className='px-6 py-6'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
