import { AlertCircle } from 'lucide-react'
import { useZodForm, type SubmitHandler } from '@/lib/form'
import { loginSchema, type LoginInput } from '@/schemas/auth.schema'
import { useLogin } from '@/hooks/useAuth'

function getLoginError(error: unknown): string {
  const status = (error as any)?.response?.status
  if (status != null && status >= 400 && status < 500) return 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
  return 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ'
}

export function LoginForm() {
  const { mutate: login, isPending, isError, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(loginSchema)

  const onSubmit: SubmitHandler<LoginInput> = (data) => {
    login(data)
  }

  return (
    <div>
      <p className="eyebrow mb-3">ເຂົ້າສູ່ລະບົບ · SIGN IN</p>

      <h1 className="text-4xl font-bold text-ink-900 mb-2">ສະບາຍດີ</h1>

      <p className="text-sm italic text-ink-500 mb-8">
        ກະລຸນາໃສ່ຊື່ ແລະ ລະຫັດຜ່ານຂອງທ່ານເພື່ອເຂົ້າສູ່ລະບົບ
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="eyebrow block mb-2"> ຊື່ຜູ້ໃຊ້ · USERNAME</label>
            <input
              {...register('username')}
              className="input"
              type="text"
              placeholder="cashier01"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-danger text-xs mt-1">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="eyebrow block mb-2">ລະຫັດຜ່ານ · PASSWORD</label>
            <input
              {...register('password')}
              className="input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-danger text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger mb-4">
            <AlertCircle size={14} className="shrink-0" />
            <span>{getLoginError(error)}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full h-12 mb-5" disabled={isPending}>
          {isPending ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500">
        ລືມລະຫັດຜ່ານ?{' '}
        <span className="font-bold text-ink-700">ຕິດຕໍ່ຜູ້ຈັດການຂອງທ່ານ.</span>
      </p>
    </div>
  )
}
