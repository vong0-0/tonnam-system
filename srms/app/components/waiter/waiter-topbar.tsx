import { NavLink } from 'react-router'
import { Loader2 } from 'lucide-react'
import { ProfileDropdown } from '@/components/common/ProfileDropdown'
import { ROUTES } from '@/constants/routes'

export default function WaiterTopbar() {
  return (
    <header className="w-full z-50 bg-green sticky top-0 left-0 right-0">
      <div className="max-w-[500px] mx-auto px-4 h-14 flex items-center justify-between">
        <a href={ROUTES.WAITER} className="text-[20px]">
          <span className="font-heading text-white">Ton</span>
          <span className="font-heading italic text-gold">Nam</span>
        </a>
        <ProfileDropdown
          className="text-white/80 hover:text-white hover:bg-white/10"
          iconClassName="text-current"
        />
      </div>

      <div className="max-w-[500px] mx-auto px-4 flex border-t border-white/10">
        <NavLink
          to={ROUTES.WAITER}
          end
          className={({ isActive }) =>
            `flex-1 inline-flex items-center justify-center py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'text-white border-white'
                : 'text-white/50 border-transparent hover:text-white/80'
            }`
          }
        >
          {({ isPending }) => (
            <>
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              ໂຕະ
            </>
          )}
        </NavLink>
        <NavLink
          to={ROUTES.WAITER_RESERVATIONS}
          className={({ isActive }) =>
            `flex-1 inline-flex items-center justify-center py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'text-white border-white'
                : 'text-white/50 border-transparent hover:text-white/80'
            }`
          }
        >
          {({ isPending }) => (
            <>
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              ການຈອງ
            </>
          )}
        </NavLink>
      </div>
    </header>
  )
}
