import { z } from 'zod'

export const createTableSchema = z.object({
  table_name: z
    .string({ error: 'ກະລຸນາໃສ່ຊື່ໂຕະ' })
    .min(1, 'ກະລຸນາໃສ່ຊື່ໂຕະ')
    .trim(),
  capacity: z.coerce
    .number({ error: 'ກະລຸນາໃສ່ຈຳນວນທີ່ນັ່ງ' })
    .int()
    .min(1, 'ຕ້ອງຢ່າງໜ້ອຍ 1 ທີ່ນັ່ງ'),
  is_temporary: z.boolean().default(false),
})

export type CreateTableInput = z.infer<typeof createTableSchema>

export const updateTableSchema = createTableSchema
  .pick({ table_name: true, capacity: true, is_temporary: true })
  .partial()
export type UpdateTableInput = z.infer<typeof updateTableSchema>
