import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ReasonModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  onConfirm: (reason: string) => void
  isPending?: boolean
}

export default function ReasonModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending,
}: ReasonModalProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open) setReason('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] w-screen">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-body">{title}</DialogTitle>
          {description && <p className="text-sm text-zinc-500">{description}</p>}
        </DialogHeader>

        <div className="space-y-2 px-4">
          <label className="text-sm font-medium">ເຫດຜົນ</label>
          <textarea
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ກະລຸນາລະບຸເຫດຜົນ..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter className='pb-4 px-4'>
          <Button className='px-4 py-2' type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ຍົກເລີກ
          </Button>
          <Button
            type="button"
            disabled={!reason.trim() || isPending}
            className="bg-blue-500 hover:bg-blue-600 font-bold px-4 py-2"
            onClick={() => onConfirm(reason.trim())}
          >
            {isPending ? 'ກຳລັງດຳເນີນການ...' : 'ຢືນຢັນ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
