import { CircleUserRound, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

interface ProfileDropdownProps {
  className?: string
  iconClassName?: string
}

export function ProfileDropdown({ className, iconClassName }: ProfileDropdownProps) {
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()

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

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 py-2 text-sm"
          onSelect={() => navigate(`/waiter${ROUTES.PROFILE}`)}
        >
          <User size={14} />
          ໂປຣໄຟລ໌
        </DropdownMenuItem>

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
