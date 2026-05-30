import { z } from 'zod'
import { STAFF_RESERVATION_STATUSES } from '@/types/index.js'

export const createReservationSchema = z.object({
  table_id: z.string().min(1),
  reserver_name: z.string().min(1).max(100).trim(),
  phone: z.string().regex(/^020[0-9]{8}$/, 'Invalid Lao phone number format'),
  party_size: z.number().int().min(1),
  reserved_at: z
    .string()
    .datetime()
    .refine((val) => new Date(val) > new Date(), 'reserved_at must be in the future'),
  notes: z.string().trim().nullable().optional().default(null),
})

export const updateReservationSchema = z
  .object({
    reserver_name: z.string().min(1).max(100).trim().optional(),
    phone: z.string().regex(/^020[0-9]{8}$/, 'Invalid Lao phone number format').optional(),
    party_size: z.number().int().min(1).optional(),
    reserved_at: z.string().datetime().optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const updateReservationStatusSchema = z.object({
  status: z.enum(STAFF_RESERVATION_STATUSES),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>
