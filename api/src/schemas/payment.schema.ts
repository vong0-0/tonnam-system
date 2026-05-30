import { z } from 'zod'
import { PaymentMethod } from '@/types/index.js'

export const createPaymentSchema = z.discriminatedUnion('method', [
  z.object({
    bill_id: z.string().min(1),
    method: z.literal(PaymentMethod.CASH),
    amount: z.number().positive(),
    cash: z.object({
      received_amount: z.number().positive(),
    }),
  }),
  z.object({
    bill_id: z.string().min(1),
    method: z.literal(PaymentMethod.QR_PROMPTPAY),
    amount: z.number().positive(),
    qr_promptpay: z.object({
      received_amount: z.number().positive(),
    }),
  }),
  z.object({
    bill_id: z.string().min(1),
    method: z.literal(PaymentMethod.MIXED),
    amount: z.number().positive(),
    cash: z.object({
      received_amount: z.number().positive(),
    }),
    qr_promptpay: z.object({
      received_amount: z.number().positive(),
    }),
  }),
])

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
