import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const refreshSchema = z.object({})

export const wsTicketSchema = z.object({})

export type LoginInput = z.infer<typeof loginSchema>
