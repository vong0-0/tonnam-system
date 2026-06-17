import { NavLink } from 'react-router'
import { UtensilsCrossed, ClipboardList, UserRound, ChevronsUpDown, Loader2, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export default function KitchenBottomNav() {
  const canSwitch = useAuthStore((s) => {
    const role = s.user?.role
    return role === ROLES.ADMIN || role === ROLES.CASHIER
  })

  const items: NavItem[] = [
    { to: ROUTES.KITCHEN, label: 'ອໍເດີ', icon: UtensilsCrossed, end: true },
    { to: ROUTES.KITCHEN_ORDER_HISTORY, label: 'ປະຫວັດ', icon: ClipboardList },
    { to: ROUTES.KITCHEN_PROFILE, label: 'ໂປຣໄຟລ໌', icon: UserRound },
    ...(canSwitch ? [{ to: ROUTES.SELECT, label: 'Switch', icon: ChevronsUpDown }] : []),
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-4 px-4">
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-lg flex items-center h-[var(--height-bottom-nav)]">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 ${isActive ? 'text-green-light' : 'text-ink-400'
              }`
            }
          >
            {({ isActive, isPending }) => (
              <>
                {isPending ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                )}
                <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
