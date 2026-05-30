import { z } from 'zod'

export const createMenuCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

export const updateMenuCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>
export type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>
