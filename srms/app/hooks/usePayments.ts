import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPayment, type CreatePaymentInput } from '@/services/payment.service'
import { BILL_KEYS } from '@/hooks/useBills'
import { TABLE_KEYS } from '@/hooks/useTables'
import { toastSuccess, toastError } from '@/lib/toast'

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentInput) => createPayment(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(data.bill._id) })
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ຊຳລະເງິນສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດຊຳລະເງິນໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
