import type { ReactNode } from 'react'
import { Phone, Mail, CalendarDays, UserRound, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/common/RoleBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { useMe } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'
import { formatDateLao } from '@/lib/date'

function InfoRow({
  icon,
  label,
  value,
  note,
  valueClass,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  note?: string
  valueClass?: string
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-t border-ink-100 first:border-t-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600">
        {icon}
      </span>
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs text-ink-400 font-medium">{label}</p>
        <p className={`text-sm font-medium text-ink-900 ${valueClass ?? ''}`}>{value}</p>
        {note && <p className="text-xs text-ink-400">{note}</p>}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useMe()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-ink-300" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້"
        description="ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນໂປຣໄຟລ໌"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">ໂປຣໄຟລ໌</h1>
        <p className="text-sm text-ink-500 mt-0.5">ຂໍ້ມູນບັນຊີຂອງທ່ານ</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column — identity card */}
        <div className="rounded-lg border border-ink-100 bg-paper p-6 flex flex-col items-center text-center gap-4">
          <Avatar size="2xl">
            <AvatarFallback className="bg-green-700 text-white font-bold text-2xl">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <p className="text-lg font-bold text-ink-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-ink-500 font-mono">@{user.username}</p>
          </div>

          <RoleBadge role={user.role} />

          <div className="w-full pt-2 border-t border-ink-100">
            <div className="flex items-center justify-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-teal-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${user.is_active ? 'text-teal-700' : 'text-red-600'}`}>
                {user.is_active ? 'ໃຊ້ງານຢູ່' : 'ປິດການໃຊ້ງານ'}
              </span>
            </div>
          </div>
        </div>

        {/* Right column — detail cards */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-lg border border-ink-100 bg-paper p-5">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1">
              ຂໍ້ມູນຕິດຕໍ່
            </p>
            <InfoRow icon={<Phone size={14} />} label="ເບີໂທລະສັບ" value={user.phone} />
            <InfoRow icon={<Mail size={14} />} label="ອີເມລ" value={user.email || '—'} />
          </div>

          <div className="rounded-lg border border-ink-100 bg-paper p-5">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1">
              ບັນຊີຜູ້ໃຊ້
            </p>
            <InfoRow
              icon={<UserRound size={14} />}
              label="ຊື່ຜູ້ໃຊ້"
              value={`@${user.username}`}
              note="ຊື່ຜູ້ໃຊ້ບໍ່ສາມາດປ່ຽນໄດ້"
            />
            <InfoRow
              icon={user.is_active ? <Check size={14} /> : <X size={14} />}
              label="ສະຖານະ"
              value={user.is_active ? 'ໃຊ້ງານຢູ່' : 'ປິດການໃຊ້ງານ'}
              valueClass={user.is_active ? 'text-teal-700' : 'text-red-600'}
            />
            <InfoRow
              icon={<CalendarDays size={14} />}
              label="ເຂົ້າຮ່ວມເມື່ອ"
              value={formatDateLao(user.createdAt)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
