import { z } from 'zod'
import { OrderItemStatus } from '@/types/index.js'

export const createOrderSchema = z.object({
  bill_id: z.string().min(1),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().min(1),
        quantity: z.number().int().min(1),
        note: z.string().optional(),
      }),
    )
    .min(1),
})

export const updateOrderItemSchema = z.union([
  z.object({ status: z.literal(OrderItemStatus.COOKED) }),
  z.object({ status: z.literal(OrderItemStatus.CANCELLED), reason: z.string().min(1) }),
  z.object({ quantity: z.number().int().min(1), reason: z.string().min(1) }),
])

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>
