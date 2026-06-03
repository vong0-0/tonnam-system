import { z } from 'zod'

export const createBillSchema = z.object({
  table_id: z.string().min(1),
  name: z.string().min(1),
})

export const cancelBillSchema = z.object({
  reason: z.string().min(1),
})

export const updateBillSchema = z.object({
  name: z.string().min(1).optional(),
  reason: z.string().min(1),
})

export const splitBillSchema = z.object({
  splits: z
    .array(
      z.object({
        name: z.string().min(1).optional(),
        order_item_ids: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(2),
})

export type CreateBillInput = z.infer<typeof createBillSchema>
export type CancelBillInput = z.infer<typeof cancelBillSchema>
export type UpdateBillInput = z.infer<typeof updateBillSchema>
export type SplitBillInput = z.infer<typeof splitBillSchema>
