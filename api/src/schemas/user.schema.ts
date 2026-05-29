import { z } from 'zod'
import { ROLES } from '@/types/index.js'

export const createUserSchema = z.object({
  username: z.string().min(1).max(50).trim(),
  first_name: z.string().min(1).max(100).trim(),
  last_name: z.string().min(1).max(100).trim(),
  phone: z.string().regex(/^020[0-9]{8}$/, 'Invalid Lao phone number format'),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).max(100),
  role: z.enum([ROLES.ADMIN, ROLES.CASHIER, ROLES.WAITER, ROLES.KITCHEN]),
})

export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).trim().optional(),
  last_name: z.string().min(1).max(100).trim().optional(),
  phone: z.string().regex(/^020[0-9]{8}$/, 'Invalid Lao phone number format').optional(),
  email: z.string().email().toLowerCase().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.CASHIER, ROLES.WAITER, ROLES.KITCHEN]).optional(),
  is_active: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
