import { z } from 'zod'

export const createMenuItemSchema = z.object({
  category_id: z.string().min(1),
  name: z.string().min(1).max(200).trim(),
  price: z.number().min(0),
  description: z.string().trim().nullable().optional().default(null),
  // Accepts a bare filename or a full URL — the frontend composes the display URL.
  image_url: z.string().trim().max(500).nullable().optional().default(null),
})

export const updateMenuItemSchema = z
  .object({
    category_id: z.string().min(1).optional(),
    name: z.string().min(1).max(200).trim().optional(),
    price: z.number().min(0).optional(),
    description: z.string().trim().optional(),
    image_url: z.string().trim().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const updateMenuItemAvailabilitySchema = z.object({
  is_available: z.boolean(),
  is_sold_out: z.boolean(),
})

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>
export type UpdateMenuItemAvailabilityInput = z.infer<typeof updateMenuItemAvailabilitySchema>
