import toast from 'react-hot-toast'

export function toastSuccess(message: string) {
  toast.success(message)
}

export function toastError(error: unknown, fallback: string) {
  const detail = (error as any)?.response?.data?.detail
  toast.error(typeof detail === 'string' ? detail : fallback)
}
