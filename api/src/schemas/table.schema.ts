import { z } from 'zod'

export const createTableSchema = z.object({
  table_name: z.string().min(1).trim(),
  capacity: z.number().int().min(1),
  is_temporary: z.boolean().optional().default(false),
})

export const updateTableSchema = z
  .object({
    table_name: z.string().min(1).trim().optional(),
    capacity: z.number().int().min(1).optional(),
    is_temporary: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const updateTableStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED']),
})

export type CreateTableInput = z.infer<typeof createTableSchema>
export type UpdateTableInput = z.infer<typeof updateTableSchema>
export type UpdateTableStatusInput = z.infer<typeof updateTableStatusSchema>
