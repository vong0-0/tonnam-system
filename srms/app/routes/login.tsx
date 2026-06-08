import { Navigate } from 'react-router'
import { LoginForm } from '@/components/common/LoginForm'
import { formatDate, DATE_FORMATS } from '@/lib/date'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_REDIRECT } from '@/constants/roles'
import Logo from "@/assets/images/icon-512.png"

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to={ROLE_REDIRECT[user.role]} replace />
  }

  const formattedDate = formatDate(new Date(), DATE_FORMATS.DATE)

  return (
    <div className="relative min-h-screen bg-green flex flex-col items-center justify-center px-4 py-12">
      <div className="crosshatch-pattern-overlay" />

      {/* Logo */}
      <div className="relative flex items-center gap-4 mb-10">
        <img src={Logo} alt="Tonnam logo" className="h-15 w-15" />
        <div>
          <p className="font-heading text-white tracking-[0.31em] text-3xl font-bold uppercase">
            TONNAM
          </p>
          <p className="text-white/60 text-[10px] tracking-widest mt-0.5">
            Smart Restaurant Management System
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="relative bg-cream rounded-2xl w-full max-w-[580px] p-10 shadow-hero">
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="mono relative text-xs text-ink-300/70 mt-8 text-center">
        {formattedDate}
      </p>
    </div>
  )
}
