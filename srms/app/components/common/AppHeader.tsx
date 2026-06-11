import { useLocation } from 'react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import type { SidebarNavGroup } from '@/components/common/app-sidebar'

type AppHeaderProps = {
  navGroups: SidebarNavGroup[]
  children?: React.ReactNode
}

function usePageTitle(navGroups: SidebarNavGroup[]): string {
  const { pathname } = useLocation()
  for (const group of navGroups) {
    for (const item of group.items) {
      const matches = item.end
        ? pathname === item.href
        : pathname.startsWith(item.href)
      if (matches) return item.label
    }
  }
  return navGroups[0]?.items[0]?.label ?? ''
}

export default function AppHeader({ navGroups, children }: AppHeaderProps) {
  const title = usePageTitle(navGroups)

  return (
    <header className="flex items-center h-14 px-4 border-b border-ink-100 bg-paper shrink-0">
      <SidebarTrigger className="text-ink-500 hover:text-ink-900" />
      <Separator orientation="vertical" className="mx-4 h-5 bg-ink-100 self-auto!" />
      <span className="text-ink-900 font-bold text-lg">{title}</span>
      {children && (
        <div className="ml-auto flex items-center gap-2">{children}</div>
      )}
    </header>
  )
}
