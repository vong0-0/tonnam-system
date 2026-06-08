import { z } from 'zod'
import { password } from '@/lib/schemas'

export const loginSchema = z.object({
  username: z
    .string({ error: 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ຂອງທ່ານ' })
    .min(1, 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ຂອງທ່ານ'),
  password: password,
})

export type LoginInput = z.infer<typeof loginSchema>
