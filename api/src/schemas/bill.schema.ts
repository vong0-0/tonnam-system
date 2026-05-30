import { z } from 'zod'

export const createBillSchema = z.object({
  table_id: z.string().min(1),
  name: z.string().min(1),
})

export const cancelBillSchema = z.object({
  reason: z.string().min(1),
})

export const splitBillSchema = z.object({
  bills: z
    .array(
      z.object({
        label: z.string().min(1),
        item_ids: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(2),
})

export type CreateBillInput = z.infer<typeof createBillSchema>
export type CancelBillInput = z.infer<typeof cancelBillSchema>
export type SplitBillInput = z.infer<typeof splitBillSchema>
