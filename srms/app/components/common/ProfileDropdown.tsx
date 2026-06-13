import { CircleUserRound, User, LogOut, ChevronsUpDown } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { cn } from '@/lib/utils'

interface ProfileDropdownProps {
  className?: string
  iconClassName?: string
}

export function ProfileDropdown({ className, iconClassName }: ProfileDropdownProps) {
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()
  const canSwitch = useAuthStore((s) => {
    const role = s.user?.role
    return role === ROLES.ADMIN || role === ROLES.CASHIER
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'rounded-full p-1 transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            className,
          )}
          aria-label="ເມນູຜູ້ໃຊ້"
        >
          <CircleUserRound size={24} className={iconClassName} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 py-2 text-sm"
          onSelect={() => navigate(`/waiter${ROUTES.PROFILE}`)}
        >
          <User size={14} />
          ໂປຣໄຟລ໌
        </DropdownMenuItem>

        {canSwitch && (
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 py-2 text-sm"
            onSelect={() => navigate(ROUTES.SELECT)}
          >
            <ChevronsUpDown size={14} />
            Switch Subsystem
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2.5 py-2 text-sm"
          onSelect={() => logout()}
        >
          <LogOut size={14} />
          ອອກຈາກລະບົບ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
