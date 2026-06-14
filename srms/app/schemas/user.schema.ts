import { z } from 'zod'
import { ROLES } from '@/constants/roles'

const laoPhone = z.string().regex(/^020[0-9]{8}$/, 'ເບີໂທບໍ່ຖືກຕ້ອງ (020XXXXXXXX)')
const roleEnum = z.enum([ROLES.ADMIN, ROLES.CASHIER, ROLES.WAITER, ROLES.KITCHEN] as const)

export const createUserSchema = z.object({
  username: z.string({ error: 'ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້' }).min(1, 'ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້').max(50).trim(),
  first_name: z.string({ error: 'ກະລຸນາໃສ່ຊື່' }).min(1, 'ກະລຸນາໃສ່ຊື່').max(100).trim(),
  last_name: z.string({ error: 'ກະລຸນາໃສ່ນາມສະກຸນ' }).min(1, 'ກະລຸນາໃສ່ນາມສະກຸນ').max(100).trim(),
  phone: laoPhone,
  email: z.string().email('Email ບໍ່ຖືກຕ້ອງ').optional().or(z.literal('')),
  password: z.string({ error: 'ກະລຸນາໃສ່ລະຫັດຜ່ານ' }).min(8, 'ລະຫັດຜ່ານຕ້ອງຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ').max(100),
  role: roleEnum,
})
export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  first_name: z.string().min(1, 'ກະລຸນາໃສ່ຊື່').max(100).trim().optional(),
  last_name: z.string().min(1, 'ກະລຸນາໃສ່ນາມສະກຸນ').max(100).trim().optional(),
  phone: laoPhone.optional(),
  email: z.string().email('Email ບໍ່ຖືກຕ້ອງ').optional().or(z.literal('')),
  role: roleEnum.optional(),
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>
