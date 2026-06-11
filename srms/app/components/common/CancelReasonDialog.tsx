import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface CancelReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onConfirm: (reason: string) => void
  isPending?: boolean
}

export function CancelReasonDialog({
  open,
  onOpenChange,
  title = 'ຢືນຢັນການຍົກເລີກ',
  description,
  onConfirm,
  isPending = false,
}: CancelReasonDialogProps) {
  const [reason, setReason] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('')
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className='font-body text-lg'>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {description && (
            <p className="text-sm text-ink-700">{description}</p>
          )}
          <div className="space-y-1.5">
            <label className="inline-block text-sm font-medium text-ink-700">ເຫດຜົນການຍົກເລີກ</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ກະລຸນາລະບຸເຫດຜົນ..."
              rows={3}
              autoFocus
              className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-green resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-auto px-4 py-3"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            ກັບໄປ
          </Button>
          <Button
            type="button"
            className="flex-1 bg-danger hover:bg-danger/90 text-white h-auto px-4 py-3"
            disabled={!reason.trim() || isPending}
            onClick={handleConfirm}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : 'ຢືນຢັນຍົກເລີກ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
