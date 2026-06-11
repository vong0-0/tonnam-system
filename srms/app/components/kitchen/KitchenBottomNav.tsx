import { NavLink } from 'react-router'
import { UtensilsCrossed, ClipboardList, UserRound, type LucideIcon } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const items: NavItem[] = [
  { to: ROUTES.KITCHEN, label: 'ອໍເດີ', icon: UtensilsCrossed, end: true },
  { to: ROUTES.KITCHEN_ORDER_HISTORY, label: 'ປະຫວັດ', icon: ClipboardList },
  { to: ROUTES.KITCHEN_PROFILE, label: 'ໂປຣໄຟລ໌', icon: UserRound },
]

export default function KitchenBottomNav() {
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
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
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
