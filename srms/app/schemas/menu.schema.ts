import { z } from 'zod'

export const createMenuItemSchema = z.object({
  category_id: z.string().min(1, 'ກະລຸນາເລືອກໝວດໝູ່'),
  name:        z.string({ error: 'ກະລຸນາໃສ່ຊື່ເມນູ' }).min(1, 'ກະລຸນາໃສ່ຊື່ເມນູ').trim(),
  price:       z.coerce.number({ error: 'ກະລຸນາໃສ່ລາຄາ' }).min(0, 'ລາຄາຕ້ອງບໍ່ຕ່ຳກວ່າ 0'),
  description: z.string().trim().optional().or(z.literal('')),
  // Accepts a bare filename or a full URL — the frontend composes the display URL.
  image_url:   z.string().trim().max(500, 'ຊື່ໄຟລ໌/URL ຍາວເກີນໄປ').optional().or(z.literal('')),
})
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>

export const updateMenuItemSchema = createMenuItemSchema.partial()
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>

export const createMenuCategorySchema = z.object({
  name: z.string({ error: 'ກະລຸນາໃສ່ຊື່ໝວດໝູ່' }).min(1, 'ກະລຸນາໃສ່ຊື່ໝວດໝູ່').trim(),
})
export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>

export const updateMenuCategorySchema = createMenuCategorySchema.partial()
export type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>
