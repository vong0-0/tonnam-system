import { Navigate, useNavigate } from 'react-router'
import { ChevronRight, LogOut } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/hooks/useAuth'
import { ROLE_ACCESS, SUBSYSTEM_META } from '@/constants/roles'

function getIcon(name: string): LucideIcon | null {
  const key = (name.charAt(0).toUpperCase() + name.slice(1)) as keyof typeof LucideIcons
  const icon = LucideIcons[key]
  return typeof icon === 'function' ? (icon as LucideIcon) : null
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:   'badge badge-occupied',
  CASHIER: 'badge badge-available',
  WAITER:  'badge badge-reserved',
  KITCHEN: 'badge badge-paid',
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN:   'ຜູ້ດູແລ',
  CASHIER: 'ພະນັກງານຈ່າຍ',
  WAITER:  'ພະນັກງານ',
  KITCHEN: 'ຫ້ອງຄົວ',
}

export default function SelectPage() {
  const user     = useAuthStore((s) => s.user)!
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()

  const access = ROLE_ACCESS[user.role]

  if (access.length === 1) {
    return <Navigate to={access[0]!} replace />
  }

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Header */}
      <header className="bg-paper border-b border-ink-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center">
              <span className="text-xs font-bold text-gold">T</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">TONNAM</p>
              <p className="text-xs text-ink-500">Smart Restaurant Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-ink-700">{user.first_name} {user.last_name}</p>
              <span className={ROLE_BADGE[user.role] ?? 'badge'}>
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </div>
            <button onClick={() => logout()} className="btn btn-ghost text-xs gap-1">
              <LogOut size={16} />
              ອອກຈາກລະບົບ
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold text-ink-900 text-center">ເລືອກລະບົບ</h1>
        <p className="text-sm text-ink-500 text-center mt-1">ທ່ານສາມາດເຂົ້າໃຊ້ລະບົບຕໍ່ໄປນີ້</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-lg w-full mx-auto">
          {access.map((route) => {
            const meta = SUBSYSTEM_META[route]
            if (!meta) return null
            const Icon = getIcon(meta.icon)
            return (
              <button
                key={route}
                onClick={() => navigate(route, { replace: true })}
                className="bg-paper rounded-xl border border-ink-100 shadow-sm p-6 cursor-pointer hover:border-green hover:shadow-md transition-all duration-200 flex items-start gap-4 text-left w-full"
              >
                <div className="w-12 h-12 rounded-lg bg-green-pale flex items-center justify-center flex-shrink-0">
                  {Icon && <Icon size={24} className="text-green" />}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-ink-900">{meta.label}</p>
                  <p className="text-sm text-ink-500 mt-0.5">{meta.description}</p>
                </div>
                <ChevronRight size={20} className="text-ink-300 self-center ml-auto flex-shrink-0" />
              </button>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-ink-300 text-center py-4">
        © 2026 TonNam · ຕ້ນນ້ຳ
      </footer>
    </div>
  )
}
