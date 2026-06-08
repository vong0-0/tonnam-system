import { z } from 'zod'
import { requiredString, password } from '@/lib/schemas'

export const loginSchema = z.object({
  username: requiredString,
  password: password,
})

export type LoginInput = z.infer<typeof loginSchema>
