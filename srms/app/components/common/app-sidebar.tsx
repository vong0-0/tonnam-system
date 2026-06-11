import { NavLink, useNavigate } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { LogOut, ChevronsUpDown } from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth.store'
import { disconnectSocket } from '@/lib/socket'
import { ROUTES } from '@/constants/routes'

export type SidebarNavItem = {
  label: string
  href: string
  icon: LucideIcon
  end?: boolean
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

type AppSidebarProps = {
  navGroups: SidebarNavGroup[]
}

export default function AppSidebar({ navGroups }: AppSidebarProps) {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const handleLogout = () => {
    disconnectSocket()
    clearAuth()
    navigate(ROUTES.LOGIN)
  }

  return (
    <Sidebar variant="inset" className="bg-green text-white border-r-0">
      <SidebarHeader className="border-b border-gold/30 py-4">
        <div className="text-center">
          <span className="font-display text-white font-bold text-2xl">Ton</span>
          <span className="italic font-display text-gold font-bold text-2xl">Nam</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {navGroups.map((group, i) => (
          <SidebarGroup key={i}>
            {group.label && (
              <SidebarGroupLabel className="text-white/50 text-xs uppercase tracking-widest px-3">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className='space-y-2'>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <NavLink to={item.href} end={item.end}>
                      {({ isActive }) => (
                        <SidebarMenuButton
                          isActive={isActive}
                          className="text-white/70 hover:text-white hover:bg-green-light data-active:bg-green-light data-active:text-white gap-3 px-3 py-3 h-auto"
                        >
                          <item.icon size={18} />
                          <span className='text-base'>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gold/30 p-3 gap-1">
        <NavLink
          to={ROUTES.SELECT}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-green-light text-xs transition-colors"
        >
          <ChevronsUpDown size={16} />
          <span>Switch Subsystem</span>
        </NavLink>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-white/50 text-xs truncate">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-1.5 rounded-md text-white/50 hover:text-white hover:bg-green-light transition-colors shrink-0"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
