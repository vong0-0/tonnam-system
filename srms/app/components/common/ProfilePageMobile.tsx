import { Phone, Mail, CalendarDays, UserRound, Check, X, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/common/RoleBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useMe } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { formatDateLao } from "@/lib/date";

export default function ProfilePageMobile() {
  const navigate = useNavigate()
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
    <div className="flex flex-col gap-4 my-8 [&_>_[data-slot=card]]:shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 self-start text-sm text-ink-500 hover:text-ink-900 transition-colors duration-150 -mt-4 mb-2"
      >
        <ChevronLeft size={18} />
        ກັບໄປ
      </button>

      <Card>
        <CardContent className="flex flex-col items-center justify-center">
          <Avatar size="2xl" className="border-3 border-solid border-gold">
            <AvatarFallback className="bg-green text-white font-bold text-2xl">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center gap-1 mt-3">
            <p className="text-[22px] font-semibold text-black">{user.first_name} {user.last_name}</p>
            <div className="space-y-3 text-center">
              {user.email && <p className="text-xs text-gold font-mono">{user.email}</p>}
              <RoleBadge role={user.role} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <p className="px-4 pb-3 text-xs font-semibold text-gold-dark">ຂໍ້ມູນຕິດຕໍ່</p>
          <div className="[&_>_div]:pt-4 [&_>_div]:pb-4 [&_>_div:last-child]:pb-0 [&_>_div]:px-4 [&_>_div]:border-t">
            <div className="flex items-center gap-4">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-green text-white">
                <Phone size={14} />
              </span>
              <div className="space-y-0.5">
                <p className="text-xs text-gold-dark">ເບີໂທລະສັບ</p>
                <p className="text-sm font-medium text-ink-900">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-green text-white">
                <Mail size={14} />
              </span>
              <div className="space-y-0.5">
                <p className="text-xs text-gold-dark">ອີເມລ</p>
                <p className="text-sm font-medium text-ink-900">{user.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-green text-white">
                <CalendarDays size={14} />
              </span>
              <div className="space-y-0.5">
                <p className="text-xs text-gold-dark">ເຂົ້າຮ່ວມເມື່ອ</p>
                <p className="text-sm font-medium text-ink-900">{formatDateLao(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <p className="px-4 pb-3 text-xs font-semibold text-gold-dark">ບັນຊີຜູ້ໃຊ້</p>
          <div className="[&_>_div]:pt-4 [&_>_div]:pb-4 [&_>_div:last-child]:pb-0 [&_>_div]:px-4 [&_>_div]:border-t">
            <div className="flex items-center gap-4">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-green text-white">
                <UserRound size={14} />
              </span>
              <div className="space-y-0.5">
                <p className="text-xs text-gold-dark">ຊື່ຜູ້ໃຊ້</p>
                <p className="text-sm font-medium text-ink-900">@{user.username}</p>
                <p className="text-xs text-gold">ຊື່ຜູ້ໃຊ້ບໍ່ສາມາດເປລ່ຽນໄດ້</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-white ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                {user.is_active ? <Check size={14} /> : <X size={14} />}
              </span>
              <div className="space-y-0.5">
                <p className="text-xs text-gold-dark">ສະຖານະ</p>
                <p className={`text-sm font-medium ${user.is_active ? 'text-success' : 'text-danger'}`}>
                  {user.is_active ? 'ໃຊ້ງານຢູ່' : 'ປິດການໃຊ້ງານ'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
