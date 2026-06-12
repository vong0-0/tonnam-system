import { z } from 'zod'
import { laoPhone } from '@/lib/schemas'

export const reservationFormSchema = z.object({
  table_id:      z.string().min(1, 'ກະລຸນາເລືອກໂຕະ'),
  reserver_name: z.string().min(1, 'ກະລຸນາໃສ່ຊື່ຜູ້ຈອງ').max(100, 'ຊື່ຕ້ອງບໍ່ເກີນ 100 ຕົວ'),
  phone:         laoPhone,
  party_size:    z.coerce.number().int().min(1, 'ກະລຸນາໃສ່ຈຳນວນຜູ້ໃຊ້ຢ່າງໜ້ອຍ 1 ຄົນ'),
  time_part:     z.string().min(1, 'ກະລຸນາເລືອກເວລາ'),
  notes:         z.string().nullable().optional(),
})

export type ReservationFormValues = z.infer<typeof reservationFormSchema>
