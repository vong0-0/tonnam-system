import { Outlet } from 'react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar, { type SidebarNavGroup } from '@/components/common/app-sidebar'
import AppHeader from '@/components/common/AppHeader'
import { ROUTES } from '@/constants/routes'
import { LayoutGrid, CalendarCheck } from 'lucide-react'

const POS_NAV: SidebarNavGroup[] = [
  {
    items: [
      { label: 'ຈັດການໂຕະ', href: ROUTES.POS, icon: LayoutGrid, end: true },
      { label: 'ຈອງໂຕະ', href: ROUTES.POS_RESERVATIONS, icon: CalendarCheck },
    ],
  },
]

export default function PosLayout() {
  return (
    <SidebarProvider>
      <AppSidebar navGroups={POS_NAV} />
      <SidebarInset className="min-h-screen bg-ink-50">
        <AppHeader navGroups={POS_NAV} />
        <div className='px-6 py-6'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
