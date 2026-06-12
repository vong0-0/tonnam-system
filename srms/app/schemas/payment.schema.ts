import { z } from 'zod'

export const paymentFormSchema = z.object({
  method: z.enum(['CASH', 'QR_PROMPTPAY', 'MIXED']),
  cash_received: z.coerce.number().min(0),
  qr_received:  z.coerce.number().min(0),
})

export type PaymentFormValues = z.infer<typeof paymentFormSchema>
