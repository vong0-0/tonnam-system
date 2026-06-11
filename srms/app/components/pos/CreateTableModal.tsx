import { useEffect } from 'react'
import { useZodForm, type SubmitHandler } from '@/lib/form'
import { createTableSchema, type CreateTableInput } from '@/schemas/table.schema'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CreateTableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateTableModal({ open, onOpenChange }: CreateTableModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(createTableSchema, {
    defaultValues: { table_name: '', capacity: undefined as unknown as number, is_temporary: false },
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit: SubmitHandler<CreateTableInput> = (data) => {
    console.log('[CreateTable]', data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-body font-bold text-ink-900">ເພິ່ມໂຕະໃໝ່</DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            ເພິ່ມໂຕະໃຫມ່ເຂົ້າສູ່ລະບົບ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-5 p-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* table_name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຊື່ໂຕະ <span className="text-danger">*</span>
              </label>
              <Input
                {...register('table_name')}
                placeholder="ເຊັ່ນ: T01, A1"
                className="border-ink-300 bg-paper"
                aria-invalid={!!errors.table_name}
              />
              {errors.table_name && (
                <p className="text-xs text-danger">{errors.table_name.message}</p>
              )}
            </div>

            {/* capacity */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຈຳນວນທີ່ນັ່ງ <span className="text-danger">*</span>
              </label>
              <Input
                {...register('capacity')}
                type="number"
                min={1}
                placeholder="4"
                className="border-ink-300 bg-paper"
                aria-invalid={!!errors.capacity}
              />
              {errors.capacity && (
                <p className="text-xs text-danger">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          {/* is_temporary */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              {...register('is_temporary')}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-green cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-ink-700">ໂຕະຊົ່ວຄາວ</p>
              <p className="text-xs text-ink-500">ໃຊ້ສຳລັບໂຕະທີ່ຈັດສ້າງຂຶ້ນຊົ່ວຄາວ ເຊັ່ນ: ໂຕະພິເສດງານລ້ຽງ</p>
            </div>
          </label>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className='px-4 py-2'
            >
              ຍົກເລີກ
            </Button>
            <Button type="submit" className="gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600">
              ເພິ່ມໂຕະ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
