import { api } from '@/lib/api'
import { API } from '@/constants/api'
import type { ApiResponse } from '@/types/api'
import type { Payment, Bill } from '@/types/entities'

export type CreatePaymentInput =
  | { bill_id: string; method: 'CASH';         amount: number; cash: { received_amount: number } }
  | { bill_id: string; method: 'QR_PROMPTPAY'; amount: number; qr_promptpay: { received_amount: number } }
  | { bill_id: string; method: 'MIXED';        amount: number; cash: { received_amount: number }; qr_promptpay: { received_amount: number } }

export async function createPayment(body: CreatePaymentInput): Promise<{ payment: Payment; bill: Bill }> {
  const { data } = await api.post<ApiResponse<{ payment: Payment; bill: Bill }>>(API.PAYMENTS, body)
  return data.data
}
