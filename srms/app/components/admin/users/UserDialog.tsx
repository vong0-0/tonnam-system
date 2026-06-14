import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { AppSelect } from '@/components/common/AppSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { useZodForm, type SubmitHandler } from '@/lib/form'
import { createUserSchema, updateUserSchema } from '@/schemas/user.schema'
import type { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema'
import type { User } from '@/types/entities'

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'CASHIER', label: 'CASHIER' },
  { value: 'WAITER', label: 'WAITER' },
  { value: 'KITCHEN', label: 'KITCHEN' },
]

interface UserDialogProps {
  user?: User
  open: boolean
  onOpenChange: (v: boolean) => void
}

function CreateUserForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: create, isPending } = useCreateUser()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm(createUserSchema, {
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      password: '',
      role: '' as unknown as CreateUserInput['role'],
    },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit: SubmitHandler<CreateUserInput> = (values) => {
    const clean = { ...values, email: values.email || undefined }
    create(clean, { onSuccess: () => { onClose(); reset() } })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 p-4 pt-0">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ຊື່ຜູ້ໃຊ້ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('username')}
            placeholder="ເຊັ່ນ: admin01"
            className="border-ink-300 bg-paper"
          />
          {errors.username && (
            <p className="text-xs text-danger">{errors.username.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ລະຫັດຜ່ານ <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
              className="border-ink-300 bg-paper pr-9"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ຊື່ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('first_name')}
            placeholder="ຊື່"
            className="border-ink-300 bg-paper"
          />
          {errors.first_name && (
            <p className="text-xs text-danger">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ນາມສະກຸນ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('last_name')}
            placeholder="ນາມສະກຸນ"
            className="border-ink-300 bg-paper"
          />
          {errors.last_name && (
            <p className="text-xs text-danger">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ເບີໂທ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('phone')}
            placeholder="020XXXXXXXX"
            className="border-ink-300 bg-paper"
          />
          {errors.phone && (
            <p className="text-xs text-danger">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="example@email.com"
            className="border-ink-300 bg-paper"
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          ຕຳແຫນ່ງ <span className="text-danger">*</span>
        </label>
        <AppSelect
          value={selectedRole}
          onValueChange={(v) => setValue('role', v as CreateUserInput['role'], { shouldValidate: true })}
          options={ROLE_OPTIONS}
          placeholder="ເລືອກຕຳແຫນ່ງ"
          triggerClassName="border-ink-300 bg-paper"
        />
        {errors.role && (
          <p className="text-xs text-danger">{errors.role.message}</p>
        )}
      </div>

      <DialogFooter className="gap-2 pt-1">
        <Button type="button" variant="outline" className="px-4 py-2" onClick={onClose}>
          ຍົກເລີກ
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gap-1.5 px-4 py-2 bg-green hover:bg-green-light text-white"
        >
          {isPending ? 'ກຳລັງບັນທຶກ...' : 'ເພີ່ມພະນັກງານ'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function EditUserForm({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const { mutate: update, isPending } = useUpdateUser()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm(updateUserSchema, {
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email ?? '',
      role: user.role,
    },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  useEffect(() => {
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email ?? '',
      role: user.role,
    })
  }, [user.id, reset])

  const onSubmit: SubmitHandler<UpdateUserInput> = (values) => {
    const clean = { ...values, email: values.email || undefined }
    update({ id: user.id, ...clean }, { onSuccess: () => { onClose(); reset() } })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 p-4 pt-0">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ຊື່ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('first_name')}
            className="border-ink-300 bg-paper"
          />
          {errors.first_name && (
            <p className="text-xs text-danger">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ນາມສະກຸນ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('last_name')}
            className="border-ink-300 bg-paper"
          />
          {errors.last_name && (
            <p className="text-xs text-danger">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            ເບີໂທ <span className="text-danger">*</span>
          </label>
          <Input
            {...register('phone')}
            placeholder="020XXXXXXXX"
            className="border-ink-300 bg-paper"
          />
          {errors.phone && (
            <p className="text-xs text-danger">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="example@email.com"
            className="border-ink-300 bg-paper"
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          ຕຳແຫນ່ງ <span className="text-danger">*</span>
        </label>
        <AppSelect
          value={selectedRole}
          onValueChange={(v) => setValue('role', v as UpdateUserInput['role'], { shouldValidate: true })}
          options={ROLE_OPTIONS}
          placeholder="ເລືອກບົດບາດ"
          triggerClassName="border-ink-300 bg-paper"
        />
        {errors.role && (
          <p className="text-xs text-danger">{errors.role.message}</p>
        )}
      </div>

      <DialogFooter className="gap-2 pt-1">
        <Button type="button" variant="outline" className="px-4 py-2" onClick={onClose}>
          ຍົກເລີກ
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gap-1.5 px-4 py-2 bg-green hover:bg-green-light text-white"
        >
          {isPending ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const isEdit = !!user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-body text-xl font-bold text-ink-900">
            {isEdit ? 'ແກ້ໄຂຂໍ້ມູນພະນັກງານ' : 'ເພີ່ມພະນັກງານໃໝ່'}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            {isEdit
              ? `ແກ້ໄຂຂໍ້ມູນ @${user.username}`
              : 'ເພີ່ມບັນຊີພະນັກງານໃໝ່ເຂົ້າສູ່ລະບົບ'}
          </DialogDescription>
        </DialogHeader>
        {isEdit
          ? <EditUserForm user={user} open={open} onClose={() => onOpenChange(false)} />
          : <CreateUserForm open={open} onClose={() => onOpenChange(false)} />
        }
      </DialogContent>
    </Dialog>
  )
}
